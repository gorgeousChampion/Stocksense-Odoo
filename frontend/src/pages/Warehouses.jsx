import { Warehouse as WarehouseIcon } from 'lucide-react'
import { mockWarehouses } from '../services/mockData'
import './Warehouses.css'

export default function Warehouses() {
  return (
    <div className="warehouses-page">
      <div className="page-header">
        <h1>Warehouses</h1>
      </div>

      <div className="warehouse-grid">
        {mockWarehouses.map(w => (
          <div key={w.id} className="warehouse-card">
            <div className="warehouse-icon">
              <WarehouseIcon size={20} />
            </div>
            <div className="warehouse-info">
              <div className="warehouse-name">{w.name}</div>
              <div className="warehouse-location">{w.location}</div>
            </div>
            <div className="warehouse-stock">
              <div className="stock-number">{w.totalStock}</div>
              <div className="stock-label">units</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}