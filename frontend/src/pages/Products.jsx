
import { useEffect, useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import './Products.css'

const API_BASE = 'http://localhost:8000/api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category: '',
    unit: '',
    reorderLevel: '',
    totalStock: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadProducts() {
    try {
      const [productsResponse, stockResponse] = await Promise.all([
        fetch(`${API_BASE}/products/`),
        fetch(`${API_BASE}/stock/`)
      ])

      if (!productsResponse.ok || !stockResponse.ok) {
        throw new Error('Failed to fetch products or stock')
      }

      const productsData = await productsResponse.json()
      const stockData = await stockResponse.json()

      const productsWithStock = productsData.map(product => {
        const totalStock = stockData
          .filter(item => item.product_id === product.id)
          .reduce((total, item) => total + item.quantity, 0)

        return {
          ...product,
          totalStock
        }
      })

      setProducts(productsWithStock)
    } catch (err) {
      console.error('Failed to fetch products:', err)
      setError('Could not load products. Check the backend connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.sku.toLowerCase().includes(search.toLowerCase())
  )

  function getStatus(product) {
    if (product.totalStock === 0) {
      return { label: 'Out of stock', className: 'status-critical' }
    }

    if (product.totalStock <= product.reorder_level) {
      return { label: 'Low stock', className: 'status-warning' }
    }

    return { label: 'In stock', className: 'status-ok' }
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function openModal() {
    setForm({
      sku: '',
      name: '',
      category: '',
      unit: '',
      reorderLevel: '',
      totalStock: ''
    })
    setError('')
    setShowModal(true)
  }

  async function handleCreate(e) {
    e.preventDefault()

    if (!form.sku || !form.name || !form.category) {
      setError('SKU, name, and category are required')
      return
    }

    setError('')

    try {
      const response = await fetch(`${API_BASE}/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          category: form.category,
          unit: form.unit || 'pcs',
          reorder_level: Number(form.reorderLevel) || 0
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Failed to create product')
        return
      }

      setShowModal(false)
      await loadProducts()
    } catch (err) {
      console.error('Failed to create product:', err)
      setError('Could not connect to the backend')
    }
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>

        <button className="btn-primary" onClick={openModal}>
          <Plus size={16} />
          New Product
        </button>
      </div>

      <div className="search-bar">
        <Search size={16} />

        <input
          type="text"
          placeholder="Search by name or SKU"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Reorder Level</th>
            <th>Total Stock</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="empty-state">
                Loading products...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty-state">
                No products found
              </td>
            </tr>
          ) : (
            filtered.map(product => {
              const status = getStatus(product)

              return (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.unit}</td>
                  <td>{product.reorder_level}</td>
                  <td>{product.totalStock}</td>
                  <td>
                    <span className={`status-badge ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>New Product</h2>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreate}>
              <div className="form-row">
                <label>SKU</label>
                <input
                  value={form.sku}
                  onChange={e => updateField('sku', e.target.value)}
                  placeholder="e.g. STL-005"
                  required
                />
              </div>

              <div className="form-row">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="form-row">
                <label>Category</label>
                <input
                  value={form.category}
                  onChange={e => updateField('category', e.target.value)}
                  placeholder="e.g. Electronics"
                  required
                />
              </div>

              <div className="form-row">
                <label>Unit of Measure</label>
                <select
                  value={form.unit}
                  onChange={e => updateField('unit', e.target.value)}
                >
                  <option value="">Select unit</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ltr">Litres (ltr)</option>
                  <option value="box">Box</option>
                </select>
              </div>

              <div className="form-row">
                <label>Reorder Level</label>
                <input
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={e => updateField('reorderLevel', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="form-row">
                <label>Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  value={form.totalStock}
                  onChange={e => updateField('totalStock', e.target.value)}
                  placeholder="0"
                />
              </div>

              {error && (
                <div className="form-status error">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary">
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}