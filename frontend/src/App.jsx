import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Warehouses from './pages/Warehouses'
import Operations from './pages/Operations'
import Ledger from './pages/Ledger'
import RiskCenter from './pages/RiskCenter'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/ledger" element={<Ledger />} />
          <Route path="/risk" element={<RiskCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}