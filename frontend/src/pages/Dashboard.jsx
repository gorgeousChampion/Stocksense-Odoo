
import { useEffect, useState } from 'react'
import { Boxes, Package, AlertTriangle, Activity } from 'lucide-react'
import './Dashboard.css'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [stock, setStock] = useState([])
  const [movements, setMovements] = useState([])
  const [warehouses, setWarehouses] = useState([])

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/products/'),
      fetch('http://localhost:8000/api/stock/'),
      fetch('http://localhost:8000/api/movements/'),
      fetch('http://localhost:8000/api/warehouses/')
    ])
      .then(async ([productsResponse, stockResponse, movementsResponse, warehousesResponse]) => {
        const productsData = await productsResponse.json()
        const stockData = await stockResponse.json()
        const movementsData = await movementsResponse.json()
        const warehousesData = await warehousesResponse.json()

        setProducts(productsData)
        setStock(stockData)
        setMovements(movementsData)
        setWarehouses(warehousesData)
      })
      .catch(error => {
        console.error('Failed to fetch dashboard data:', error)
      })
  }, [])

  const totalStock = stock.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const totalSkus = products.length

  const lowStockCount = products.filter(product => {
    const productStock = stock
      .filter(item => item.product_id === product.id)
      .reduce((total, item) => total + item.quantity, 0)

    return productStock <= product.reorder_level
  }).length

  const recentMovements = movements.slice(0, 8).map(movement => {
    const product = products.find(
      product => product.id === movement.product_id
    )

    const warehouse = warehouses.find(
      warehouse => warehouse.id === movement.warehouse_id
    )

    let change = movement.quantity

    if (
      movement.movement_type === 'DELIVERY' ||
      movement.movement_type === 'TRANSFER_OUT'
    ) {
      change = -Math.abs(movement.quantity)
    }

    return {
      id: movement.id,
      sku: product ? product.sku : `Product #${movement.product_id}`,
      warehouse: warehouse
        ? warehouse.name
        : `Warehouse #${movement.warehouse_id}`,
      operation: movement.movement_type,
      change,
      timestamp: new Date(movement.created_at).toLocaleString()
    }
  })

  const stats = [
    {
      label: 'Total Stock Units',
      value: totalStock,
      icon: Boxes
    },
    {
      label: 'Number of SKUs',
      value: totalSkus,
      icon: Package
    },
    {
      label: 'Low Stock Items',
      value: lowStockCount,
      icon: AlertTriangle,
      warn: lowStockCount > 0
    },
  ]

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div
            key={s.label}
            className={`stat-card${s.warn ? ' stat-warn' : ''}`}
          >
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
              <th>SKU</th>
              <th>Warehouse</th>
              <th>Operation</th>
              <th>Change</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {recentMovements.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state">
                  No movements found
                </td>
              </tr>
            ) : (
              recentMovements.map(m => (
                <tr key={m.id}>
                  <td>{m.sku}</td>
                  <td>{m.warehouse}</td>
                  <td>{m.operation}</td>
                  <td
                    className={
                      m.change >= 0
                        ? 'change-positive'
                        : 'change-negative'
                    }
                  >
                    {m.change >= 0 ? `+${m.change}` : m.change}
                  </td>
                  <td>{m.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}