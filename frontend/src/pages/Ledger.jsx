
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import './Ledger.css'

export default function Ledger() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/movements/'),
      fetch('http://localhost:8000/api/products/'),
      fetch('http://localhost:8000/api/warehouses/')
    ])
      .then(async ([movementsResponse, productsResponse, warehousesResponse]) => {
        const movementsData = await movementsResponse.json()
        const productsData = await productsResponse.json()
        const warehousesData = await warehousesResponse.json()

        setMovements(movementsData)
        setProducts(productsData)
        setWarehouses(warehousesData)
      })
      .catch(error => {
        console.error('Failed to fetch ledger data:', error)
      })
  }, [])

  const ledger = movements.map(entry => {
    const product = products.find(p => p.id === entry.product_id)
    const warehouse = warehouses.find(w => w.id === entry.warehouse_id)

    let change = entry.quantity

    if (entry.movement_type === 'DELIVERY' || entry.movement_type === 'TRANSFER_OUT') {
      change = -Math.abs(entry.quantity)
    }

    return {
      id: entry.id,
      sku: product ? product.sku : `Product #${entry.product_id}`,
      warehouse: warehouse ? warehouse.name : `Warehouse #${entry.warehouse_id}`,
      operation: entry.movement_type,
      change,
      timestamp: new Date(entry.created_at).toLocaleString()
    }
  })

  const filtered = ledger.filter(entry =>
    entry.sku.toLowerCase().includes(search.toLowerCase()) ||
    entry.warehouse.toLowerCase().includes(search.toLowerCase()) ||
    entry.operation.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="ledger-page">
      <div className="page-header">
        <h1>Inventory Ledger</h1>
      </div>

      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search by SKU, warehouse, or operation"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Warehouse</th>
            <th>Operation</th>
            <th>Quantity Change</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-state">
                No movements found
              </td>
            </tr>
          ) : (
            filtered.map(entry => (
              <tr key={entry.id}>
                <td>{entry.sku}</td>
                <td>{entry.warehouse}</td>
                <td>{entry.operation}</td>
                <td
                  className={
                    entry.change >= 0
                      ? 'change-positive'
                      : 'change-negative'
                  }
                >
                  {entry.change >= 0 ? `+${entry.change}` : entry.change}
                </td>
                <td>{entry.timestamp}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}