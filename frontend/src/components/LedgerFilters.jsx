import { filterOptions } from '../services/mockData'
import './LedgerFilters.css'

export default function LedgerFilters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="filters-bar">
      <select value={filters.documentType} onChange={e => update('documentType', e.target.value)}>
        <option value="">All Document Types</option>
        {filterOptions.documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      <select value={filters.status} onChange={e => update('status', e.target.value)}>
        <option value="">All Statuses</option>
        {filterOptions.statuses.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <select value={filters.warehouse} onChange={e => update('warehouse', e.target.value)}>
        <option value="">All Warehouses</option>
        {filterOptions.warehouses.map(w => <option key={w} value={w}>{w}</option>)}
      </select>

      <select value={filters.category} onChange={e => update('category', e.target.value)}>
        <option value="">All Categories</option>
        {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  )
}