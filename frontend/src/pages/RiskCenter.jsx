import { AlertOctagon, Eye } from 'lucide-react'
import { mockRiskItems, estimateDaysRemaining } from '../services/mockData'
import './RiskCenter.css'

export default function RiskCenter() {
  return (
    <div className="risk-page">
      <div className="page-header">
        <h1>Stock Risk & Action Center</h1>
      </div>

      <div className="risk-list">
        {mockRiskItems.map(item => {
          const days = estimateDaysRemaining(item)
          const isCritical = item.severity === 'critical'
          return (
            <div key={item.id} className={`risk-card ${isCritical ? 'risk-critical' : 'risk-watch'}`}>
              <div className="risk-icon">
                {isCritical ? <AlertOctagon size={20} /> : <Eye size={20} />}
              </div>
              <div className="risk-body">
                <div className="risk-top-row">
                  <span className="risk-product">{item.product}</span>
                  <span className="risk-sku">{item.sku}</span>
                  <span className={`risk-badge ${isCritical ? 'badge-critical' : 'badge-watch'}`}>
                    {isCritical ? 'Critical' : 'Watch'}
                  </span>
                </div>
                <div className="risk-meta">
                  {item.warehouse} · {item.currentStock} units in stock · reorder level {item.reorderLevel}
                  {days !== null && ` · est. ${days} days remaining`}
                </div>
                <div className="risk-reason">{item.reason}</div>
                <div className="risk-action">Suggested action: {item.suggestedAction}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}