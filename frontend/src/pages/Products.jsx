import { useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { mockProducts } from '../services/mockData'
import './Products.css'

export default function Products() {
  const [products, setProducts] = useState(mockProducts)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ sku: '', name: '', category: '', reorderLevel: '', totalStock: '' })
  const [error, setError] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  function getStatus(product) {
    if (product.totalStock === 0) return { label: 'Out of stock', className: 'status-critical' }
    if (product.totalStock <= product.reorderLevel) return { label: 'Low stock', className: 'status-warning' }
    return { label: 'In stock', className: 'status-ok' }
  }

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function openModal() {
    setForm({ sku: '', name: '', category: '', reorderLevel: '', totalStock: '' })
    setError('')
    setShowModal(true)
  }

  function handleCreate(e) {
    e.preventDefault()
    if (!form.sku || !form.name || !form.category) {
      setError('SKU, name, and category are required')
      return
    }
    // TODO: replace with real API call once teammate's endpoint is ready
    // e.g. axios.post('/api/products/', form)
    const newProduct = {
      id: products.length + 1,
      sku: form.sku,
      name: form.name,
      category: form.category,
      reorderLevel: Number(form.reorderLevel) || 0,
      totalStock: Number(form.totalStock) || 0,
    }
    setProducts(prev => [...prev, newProduct])
    setShowModal(false)
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
            <th>Reorder Level</th>
            <th>Total Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-state">No products found</td>
            </tr>
          ) : (
            filtered.map(p => {
              const status = getStatus(p)
              return (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.reorderLevel}</td>
                  <td>{p.totalStock}</td>
                  <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Product</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCreate}>
              <div className="form-row">
                <label>SKU</label>
                <input value={form.sku} onChange={e => updateField('sku', e.target.value)} placeholder="e.g. STL-005" />
              </div>
              <div className="form-row">
                <label>Name</label>
                <input value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Product name" />
              </div>
              <div className="form-row">
                <label>Category</label>
                <input value={form.category} onChange={e => updateField('category', e.target.value)} placeholder="e.g. Electronics" />
              </div>
              <div className="form-row">
                <label>Reorder Level</label>
                <input type="number" min="0" value={form.reorderLevel} onChange={e => updateField('reorderLevel', e.target.value)} placeholder="0" />
              </div>
              <div className="form-row">
                <label>Initial Stock</label>
                <input type="number" min="0" value={form.totalStock} onChange={e => updateField('totalStock', e.target.value)} placeholder="0" />
              </div>
              {error && <div className="form-status error">{error}</div>}
              <button type="submit" className="btn-primary">Create Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}