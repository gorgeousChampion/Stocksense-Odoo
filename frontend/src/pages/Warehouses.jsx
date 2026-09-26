
import { useEffect, useState } from 'react'
import { Warehouse as WarehouseIcon } from 'lucide-react'
import './Warehouses.css'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([])
  const [stock, setStock] = useState([])

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/warehouses/'),
      fetch('http://localhost:8000/api/stock/')
    ])
      .then(async ([warehousesResponse, stockResponse]) => {
        const warehousesData = await warehousesResponse.json()
        const stockData = await stockResponse.json()

        setWarehouses(warehousesData)
        setStock(stockData)
      })
      .catch(error => {
        console.error('Failed to fetch warehouse data:', error)
      })
  }, [])

  return (
    <div className="warehouses-page">
      <div className="warehouse-grid">
        {warehouses.map(warehouse => {
          const totalStock = stock
            .filter(item => item.warehouse_id === warehouse.id)
            .reduce((total, item) => total + item.quantity, 0)

          return (
            <div key={warehouse.id} className="warehouse-card">
              <div className="warehouse-icon">
                <WarehouseIcon size={20} />
              </div>

              <div className="warehouse-info">
                <div className="warehouse-name">
                  {warehouse.name}
                </div>

                <div className="warehouse-location">
                  {warehouse.location}
                </div>
              </div>

              <div className="warehouse-stock">
                <div className="stock-number">
                  {totalStock}
                </div>

                <div className="stock-label">
                  units
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}