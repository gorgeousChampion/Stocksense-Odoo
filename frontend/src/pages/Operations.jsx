
import { useEffect, useState } from 'react'
import {
  PackagePlus,
  PackageMinus,
  ArrowLeftRight,
  ClipboardEdit
} from 'lucide-react'
import './Operations.css'
import Toast from '../components/Toast'

const TABS = [
  { key: 'receive', label: 'Receive Stock', icon: PackagePlus },
  { key: 'deliver', label: 'Deliver Stock', icon: PackageMinus },
  { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { key: 'adjust', label: 'Adjust Stock', icon: ClipboardEdit },
]

export default function Operations() {
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [stock, setStock] = useState([])

  const [activeTab, setActiveTab] = useState('receive')
  const [form, setForm] = useState({
    product: '',
    warehouse: '',
    toWarehouse: '',
    quantity: '',
    reason: ''
  })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/products/'),
      fetch('http://localhost:8000/api/warehouses/'),
      fetch('http://localhost:8000/api/stock/')
    ])
      .then(async ([productsResponse, warehousesResponse, stockResponse]) => {
        const productsData = await productsResponse.json()
        const warehousesData = await warehousesResponse.json()
        const stockData = await stockResponse.json()

        setProducts(productsData)
        setWarehouses(warehousesData)
        setStock(stockData)
      })
      .catch(error => {
        console.error('Failed to fetch operation data:', error)
        setStatus({
          type: 'error',
          message: 'Failed to load products or warehouses'
        })
      })
  }, [])

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function showError(message) {
    setStatus({
      type: 'error',
      message
    })

    setTimeout(() => setStatus(null), 3000)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.product || !form.warehouse || !form.quantity) {
      showError('Please fill in all required fields')
      return
    }

    if (activeTab === 'transfer' && !form.toWarehouse) {
      showError('Please select a destination warehouse')
      return
    }

    if (
      activeTab === 'transfer' &&
      form.warehouse === form.toWarehouse
    ) {
      showError('Source and destination warehouses must be different')
      return
    }

    if (Number(form.quantity) <= 0) {
      showError('Quantity must be greater than zero')
      return
    }

    let endpoint = ''
    let body = {}
    let successMessage = ''

    if (activeTab === 'receive') {
      endpoint = 'receipts'

      body = {
        product_id: Number(form.product),
        warehouse_id: Number(form.warehouse),
        quantity: Number(form.quantity),
        note: null,
      }

      successMessage = `Stock received successfully. New stock: `
    }

    if (activeTab === 'deliver') {
      endpoint = 'deliveries'

      body = {
        product_id: Number(form.product),
        warehouse_id: Number(form.warehouse),
        quantity: Number(form.quantity),
        note: null,
      }

      successMessage = `Stock delivered successfully. New stock: `
    }

    if (activeTab === 'transfer') {
      endpoint = 'transfers'

      body = {
        product_id: Number(form.product),
        source_warehouse_id: Number(form.warehouse),
        destination_warehouse_id: Number(form.toWarehouse),
        quantity: Number(form.quantity),
        note: null,
      }
    }

    if (activeTab === 'adjust') {
      const currentStock = stock.find(
        item =>
          item.product_id === Number(form.product) &&
          item.warehouse_id === Number(form.warehouse)
      )

      const currentQuantity = currentStock ? currentStock.quantity : 0
      const countedQuantity = Number(form.quantity)
      const adjustment = countedQuantity - currentQuantity

      endpoint = 'adjustments'

      body = {
        product_id: Number(form.product),
        warehouse_id: Number(form.warehouse),
        quantity: adjustment,
        note: form.reason || null,
      }

      successMessage = `Stock adjusted successfully. New stock: `
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/operations/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showError(data.detail || 'Operation failed')
        return
      }

      if (activeTab === 'transfer') {
        setStatus({
          type: 'success',
          message:
            `Transfer successful. Source stock: ${data.source_new_stock_quantity}, ` +
            `Destination stock: ${data.destination_new_stock_quantity}`
        })
      } else {
        setStatus({
          type: 'success',
          message: successMessage + data.new_stock_quantity
        })
      }

      setForm({
        product: '',
        warehouse: '',
        toWarehouse: '',
        quantity: '',
        reason: ''
      })

      setTimeout(() => setStatus(null), 3000)

      // Refresh stock after the operation so future adjustments
      // use the latest database value.
      const stockResponse = await fetch(
        'http://localhost:8000/api/stock/'
      )

      if (stockResponse.ok) {
        const stockData = await stockResponse.json()
        setStock(stockData)
      }
    } catch (error) {
      console.error('Operation failed:', error)

      showError('Could not connect to the backend')
    }
  }

  function switchTab(key) {
    setActiveTab(key)
    setStatus(null)

    setForm({
      product: '',
      warehouse: '',
      toWarehouse: '',
      quantity: '',
      reason: ''
    })
  }

  return (
    <div className="operations-page">
      <div className="page-header">
        <h1>Stock Operations</h1>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-item${activeTab === t.key ? ' active' : ''}`}
            onClick={() => switchTab(t.key)}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <form className="operation-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Product</label>

          <select
            value={form.product}
            onChange={e => updateField('product', e.target.value)}
          >
            <option value="">Select a product</option>

            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>
            {activeTab === 'transfer'
              ? 'From Warehouse'
              : 'Warehouse'}
          </label>

          <select
            value={form.warehouse}
            onChange={e => updateField('warehouse', e.target.value)}
          >
            <option value="">Select a warehouse</option>

            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'transfer' && (
          <div className="form-row">
            <label>To Warehouse</label>

            <select
              value={form.toWarehouse}
              onChange={e => updateField('toWarehouse', e.target.value)}
            >
              <option value="">Select destination</option>

              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-row">
          <label>
            {activeTab === 'adjust'
              ? 'Counted Quantity'
              : 'Quantity'}
          </label>

          <input
            type="number"
            min="0"
            value={form.quantity}
            onChange={e => updateField('quantity', e.target.value)}
            placeholder="0"
          />
        </div>

        {activeTab === 'adjust' && (
          <div className="form-row">
            <label>Reason</label>

            <input
              type="text"
              value={form.reason}
              onChange={e => updateField('reason', e.target.value)}
              placeholder="e.g. damaged stock, recount"
            />
          </div>
        )}

        <button type="submit" className="btn-primary">
          Submit
        </button>
      </form>

      <Toast
        message={status?.message}
        type={status?.type}
      />
    </div>
  )
}