import { useState } from 'react'
import { Search } from 'lucide-react'
import { mockLedger } from '../services/mockData'
import './Ledger.css'

export default function Ledger() {
  const [search, setSearch] = useState('')

  const filtered = mockLedger.filter(entry =>
    entry.product.toLowerCase().includes(search.toLowerCase()) ||
    entry.warehouse.toLowerCase().includes(search.toLowerCase()) ||
    entry.operation.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="ledger-page">
      <div className="page-header">
        <h1>Inventory Ledger</h1>
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by product, warehouse, or operation"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Warehouse</th>
            <th>Operation</th>
            <th>Quantity Change</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-state">No movements found</td>
            </tr>
          ) : (
            filtered.map(entry => (
              <tr key={entry.id}>
                <td>{entry.sku}</td>
                <td>{entry.warehouse}</td>
                <td>{entry.operation}</td>
                <td className={entry.change >= 0 ? 'change-positive' : 'change-negative'}>
                  {entry.change >= 0 ? `+${entry.change}` : entry.change}
                </td>
                <td>{entry.timestamp}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}