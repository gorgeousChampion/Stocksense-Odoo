import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ArrowLeftRight, ScrollText, AlertTriangle, Settings, ChevronDown, User, LogOut } from 'lucide-react'
import './AppLayout.css'

export default function AppLayout() {
  const [operationsOpen, setOperationsOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">StockSense</div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/products" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Package size={18} />
            <span>Products</span>
          </NavLink>

          <button className="nav-item nav-group-toggle" onClick={() => setOperationsOpen(o => !o)}>
            <ArrowLeftRight size={18} />
            <span>Operations</span>
            <ChevronDown size={14} className={`chevron${operationsOpen ? ' open' : ''}`} />
          </button>
          {operationsOpen && (
            <div className="nav-subgroup">
              <NavLink to="/operations" className={({ isActive }) => `nav-item nav-sub${isActive ? ' active' : ''}`}>
                <span>Receipts / Delivery / Adjustment</span>
              </NavLink>
              <NavLink to="/ledger" className={({ isActive }) => `nav-item nav-sub${isActive ? ' active' : ''}`}>
                <span>Move History</span>
              </NavLink>
            </div>
          )}

          <NavLink to="/risk" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <AlertTriangle size={18} />
            <span>Risk Center</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-profile">
          <button className="nav-item nav-group-toggle" onClick={() => setProfileOpen(o => !o)}>
            <User size={18} />
            <span>Profile</span>
            <ChevronDown size={14} className={`chevron${profileOpen ? ' open' : ''}`} />
          </button>
          {profileOpen && (
            <div className="nav-subgroup">
              <button className="nav-item nav-sub">
                <User size={14} />
                <span>My Profile</span>
              </button>
              <button className="nav-item nav-sub">
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
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