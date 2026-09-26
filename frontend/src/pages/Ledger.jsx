import { useState } from 'react'
import { Search } from 'lucide-react'
import { mockLedger } from '../services/mockData'
import LedgerFilters from '../components/LedgerFilters'
import './Ledger.css'

const STATUS_CLASS = {
  Draft: 'status-badge status-draft',
  Waiting: 'status-badge status-waiting',
  Ready: 'status-badge status-ready',
  Done: 'status-badge status-done',
  Cancelled: 'status-badge status-cancelled',
}

export default function Ledger() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ documentType: '', status: '', warehouse: '', category: '' })

  const filtered = mockLedger.filter(entry => {
    const matchesSearch =
      entry.product.toLowerCase().includes(search.toLowerCase()) ||
      entry.sku.toLowerCase().includes(search.toLowerCase()) ||
      entry.warehouse.toLowerCase().includes(search.toLowerCase())
    const matchesType = !filters.documentType || entry.operation === filters.documentType
    const matchesStatus = !filters.status || entry.status === filters.status
    const matchesWarehouse = !filters.warehouse || entry.warehouse === filters.warehouse
    const matchesCategory = !filters.category || entry.category === filters.category
    return matchesSearch && matchesType && matchesStatus && matchesWarehouse && matchesCategory
  })

  return (
    <div className="ledger-page">
      <div className="page-header">
        <h1>Inventory Ledger</h1>
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by SKU, product, or warehouse"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <LedgerFilters filters={filters} onChange={setFilters} />

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Warehouse</th>
            <th>Type</th>
            <th>Status</th>
            <th>Quantity Change</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-state">No movements found</td>
            </tr>
          ) : (
            filtered.map(entry => (
              <tr key={entry.id}>
                <td>{entry.sku}</td>
                <td>{entry.warehouse}</td>
                <td>{entry.operation}</td>
                <td><span className={STATUS_CLASS[entry.status]}>{entry.status}</span></td>
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