import { Boxes, Package, AlertTriangle, Activity } from 'lucide-react'
import { getDashboardStats } from '../services/mockData'
import './Dashboard.css'

export default function Dashboard() {
  const { totalStock, totalSkus, lowStockCount, recentMovements } = getDashboardStats()

  const stats = [
    { label: 'Total Stock Units', value: totalStock, icon: Boxes },
    { label: 'Number of SKUs', value: totalSkus, icon: Package },
    { label: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle, warn: lowStockCount > 0 },
  ]

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card${s.warn ? ' stat-warn' : ''}`}>
            <div className="stat-icon">
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-title">
          <Activity size={16} />
          Recent Inventory Movements
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Operation</th>
              <th>Change</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {recentMovements.map(m => (
              <tr key={m.id}>
                <td>{m.product}</td>
                <td>{m.warehouse}</td>
                <td>{m.operation}</td>
                <td className={m.change >= 0 ? 'change-positive' : 'change-negative'}>
                  {m.change >= 0 ? `+${m.change}` : m.change} 
                </td>
                <td>{m.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}