import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { mockProducts } from '../services/mockData'
import './Products.css'

export default function Products() {
  const [search, setSearch] = useState('')

  const filtered = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  function getStatus(product) {
    if (product.totalStock === 0) return { label: 'Out of stock', className: 'status-critical' }
    if (product.totalStock <= product.reorderLevel) return { label: 'Low stock', className: 'status-warning' }
    return { label: 'In stock', className: 'status-ok' }
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn-primary">
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
    </div>
  )
}