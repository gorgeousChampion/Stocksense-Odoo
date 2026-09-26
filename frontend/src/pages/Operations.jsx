import { useState } from 'react'
import { PackagePlus, PackageMinus, ArrowLeftRight, ClipboardEdit } from 'lucide-react'
import { productOptions, warehouseOptions } from '../services/mockData'
import './Operations.css'

const TABS = [
  { key: 'receive', label: 'Receive Stock', icon: PackagePlus },
  { key: 'deliver', label: 'Deliver Stock', icon: PackageMinus },
  { key: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
  { key: 'adjust', label: 'Adjust Stock', icon: ClipboardEdit },
]

export default function Operations() {
  const [activeTab, setActiveTab] = useState('receive')
  const [form, setForm] = useState({ product: '', warehouse: '', toWarehouse: '', quantity: '', reason: '' })
  const [status, setStatus] = useState(null)

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.product || !form.warehouse || !form.quantity) {
      setStatus({ type: 'error', message: 'Please fill in all required fields' })
      return
    }
    if (activeTab === 'transfer' && !form.toWarehouse) {
      setStatus({ type: 'error', message: 'Please select a destination warehouse' })
      return
    }
    if (Number(form.quantity) <= 0) {
      setStatus({ type: 'error', message: 'Quantity must be greater than zero' })
      return
    }

    // TODO: replace with real API call once teammate's endpoint is ready
    // e.g. axios.post('/api/operations/receipts', form)
    setStatus({ type: 'success', message: `${TABS.find(t => t.key === activeTab).label} recorded (mock, not yet sent to backend)` })
    setForm({ product: '', warehouse: '', toWarehouse: '', quantity: '', reason: '' })
  }

  function switchTab(key) {
    setActiveTab(key)
    setStatus(null)
    setForm({ product: '', warehouse: '', toWarehouse: '', quantity: '', reason: '' })
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
          <select value={form.product} onChange={e => updateField('product', e.target.value)}>
            <option value="">Select a product</option>
            {productOptions.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>{activeTab === 'transfer' ? 'From Warehouse' : 'Warehouse'}</label>
          <select value={form.warehouse} onChange={e => updateField('warehouse', e.target.value)}>
            <option value="">Select a warehouse</option>
            {warehouseOptions.map(w => (
              <option key={w.id} value={w.id}>{w.label}</option>
            ))}
          </select>
        </div>

        {activeTab === 'transfer' && (
          <div className="form-row">
            <label>To Warehouse</label>
            <select value={form.toWarehouse} onChange={e => updateField('toWarehouse', e.target.value)}>
              <option value="">Select destination</option>
              {warehouseOptions.map(w => (
                <option key={w.id} value={w.id}>{w.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-row">
          <label>{activeTab === 'adjust' ? 'Counted Quantity' : 'Quantity'}</label>
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

        {status && (
          <div className={`form-status ${status.type}`}>{status.message}</div>
        )}

        <button type="submit" className="btn-primary">Submit</button>
      </form>
    </div>
  )
}