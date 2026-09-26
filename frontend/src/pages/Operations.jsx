import { useEffect, useState } from 'react'
import {
  PackagePlus,
  PackageMinus,
  ArrowLeftRight,
  ClipboardEdit,
  Clock
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
  const [inventoryOperations, setInventoryOperations] = useState([])

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
    loadData()
  }, [])

  async function loadData() {
    try {
      const [
        productsResponse,
        warehousesResponse,
        stockResponse,
        operationsResponse
      ] = await Promise.all([
        fetch('http://localhost:8000/api/products/'),
        fetch('http://localhost:8000/api/warehouses/'),
        fetch('http://localhost:8000/api/stock/'),
        fetch('http://localhost:8000/api/inventory-operations/')
      ])

      const productsData = await productsResponse.json()
      const warehousesData = await warehousesResponse.json()
      const stockData = await stockResponse.json()
      const operationsData = await operationsResponse.json()

      setProducts(productsData)
      setWarehouses(warehousesData)
      setStock(stockData)
      setInventoryOperations(operationsData)
    } catch (error) {
      console.error('Failed to fetch operation data:', error)
      setStatus({
        type: 'error',
        message: 'Failed to load products or warehouses'
      })
    }
  }

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

      await loadData()
    } catch (error) {
      console.error('Operation failed:', error)
      showError('Could not connect to the backend')
    }
  }

  async function validateOperation(id) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/inventory-operations/${id}/validate`,
        {
          method: 'POST'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showError(data.detail || 'Could not validate operation')
        return
      }

      setStatus({
        type: 'success',
        message: 'Operation validated successfully'
      })

      await loadData()

      setTimeout(() => setStatus(null), 3000)
    } catch (error) {
      console.error('Validation failed:', error)
      showError('Could not connect to the backend')
    }
  }

  async function cancelOperation(id) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/inventory-operations/${id}/cancel`,
        {
          method: 'POST'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        showError(data.detail || 'Could not cancel operation')
        return
      }

      setStatus({
        type: 'success',
        message: 'Operation canceled'
      })

      await loadData()

      setTimeout(() => setStatus(null), 3000)
    } catch (error) {
      console.error('Cancellation failed:', error)
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

  function getProductName(productId) {
    const product = products.find(p => p.id === productId)
    return product ? `${product.name} (${product.sku})` : `Product #${productId}`
  }

  function getWarehouseName(warehouseId) {
    const warehouse = warehouses.find(w => w.id === warehouseId)
    return warehouse ? warehouse.name : `Warehouse #${warehouseId}`
  }

  const pendingOperations = inventoryOperations.filter(
    operation => operation.status === 'Waiting'
  )

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

      <div className="dashboard-section">
        <div className="section-title">
          <Clock size={16} />
          Pending Operations
        </div>

        {pendingOperations.length === 0 ? (
          <div className="empty-state">
            No pending operations
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Quantity</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingOperations.map(operation => (
                <tr key={operation.id}>
                  <td>{operation.operation_type}</td>

                  <td>
                    {getProductName(operation.product_id)}
                  </td>

                  <td>
                    {getWarehouseName(operation.warehouse_id)}
                  </td>

                  <td>{operation.quantity}</td>

                  <td>
                    {operation.due_date
                      ? new Date(operation.due_date).toLocaleString()
                      : 'No due date'}
                  </td>

                  <td>{operation.status}</td>

                  <td>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => validateOperation(operation.id)}
                    >
                      Validate
                    </button>

                    <button
                      type="button"
                      onClick={() => cancelOperation(operation.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Toast
        message={status?.message}
        type={status?.type}
      />
    </div>
  )
}