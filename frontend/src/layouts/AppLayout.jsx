import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, Warehouse, ArrowLeftRight, ScrollText, AlertTriangle } from 'lucide-react'
import './AppLayout.css'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
  { to: '/operations', label: 'Stock Operations', icon: ArrowLeftRight },
  { to: '/ledger', label: 'Inventory Ledger', icon: ScrollText },
  { to: '/risk', label: 'Risk Center', icon: AlertTriangle },
]

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">StockSense</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-area">
        <header className="top-header">
          <div className="header-title">Inventory Overview</div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}