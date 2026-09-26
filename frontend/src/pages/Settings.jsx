import { useState } from 'react'
import { Warehouse } from 'lucide-react'
import Warehouses from './Warehouses'
import './Settings.css'

const SETTINGS_TABS = [
  { key: 'warehouse', label: 'Warehouse', icon: Warehouse },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('warehouse')

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-layout">
        <nav className="settings-nav">
          {SETTINGS_TABS.map(t => (
            <button
              key={t.key}
              className={`settings-nav-item${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {activeTab === 'warehouse' && <Warehouses />}
        </div>
      </div>
    </div>
  )
}