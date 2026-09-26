
import { useEffect, useState } from 'react'
import { AlertOctagon, Eye } from 'lucide-react'
import './RiskCenter.css'

export default function RiskCenter() {
  const [products, setProducts] = useState([])
  const [stock, setStock] = useState([])
  const [warehouses, setWarehouses] = useState([])

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/api/products/'),
      fetch('http://localhost:8000/api/stock/'),
      fetch('http://localhost:8000/api/warehouses/')
    ])
      .then(async ([productsResponse, stockResponse, warehousesResponse]) => {
        const productsData = await productsResponse.json()
        const stockData = await stockResponse.json()
        const warehousesData = await warehousesResponse.json()

        setProducts(productsData)
        setStock(stockData)
        setWarehouses(warehousesData)
      })
      .catch(error => {
        console.error('Failed to fetch risk data:', error)
      })
  }, [])

  const riskItems = []

  products.forEach(product => {
    warehouses.forEach(warehouse => {
      const stockRecord = stock.find(
        item =>
          item.product_id === product.id &&
          item.warehouse_id === warehouse.id
      )

      const currentStock = stockRecord ? stockRecord.quantity : 0

      if (currentStock <= product.reorder_level) {
        const isCritical = currentStock === 0

        riskItems.push({
          id: `${product.id}-${warehouse.id}`,
          product: product.name,
          sku: product.sku,
          warehouse: warehouse.name,
          currentStock,
          reorderLevel: product.reorder_level,
          severity: isCritical ? 'critical' : 'watch',
          reason: isCritical
            ? 'Product is out of stock at this warehouse.'
            : 'Stock is at or below the reorder level.',
          suggestedAction: isCritical
            ? `Replenish at least ${product.reorder_level || 1} units`
            : `Replenish stock above ${product.reorder_level} units`
        })
      }
    })
  })

  return (
    <div className="risk-page">
      <div className="page-header">
        <h1>Stock Risk & Action Center</h1>
      </div>

      <div className="risk-list">
        {riskItems.length === 0 ? (
          <div className="empty-state">
            No stock risks detected.
          </div>
        ) : (
          riskItems.map(item => {
            const isCritical = item.severity === 'critical'

            return (
              <div
                key={item.id}
                className={`risk-card ${
                  isCritical ? 'risk-critical' : 'risk-watch'
                }`}
              >
                <div className="risk-icon">
                  {isCritical ? (
                    <AlertOctagon size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </div>

                <div className="risk-body">
                  <div className="risk-top-row">
                    <span className="risk-product">
                      {item.product}
                    </span>

                    <span className="risk-sku">
                      {item.sku}
                    </span>

                    <span
                      className={`risk-badge ${
                        isCritical
                          ? 'badge-critical'
                          : 'badge-watch'
                      }`}
                    >
                      {isCritical ? 'Critical' : 'Watch'}
                    </span>
                  </div>

                  <div className="risk-meta">
                    {item.warehouse} · {item.currentStock} units in
                    stock · reorder level {item.reorderLevel}
                  </div>

                  <div className="risk-reason">
                    {item.reason}
                  </div>

                  <div className="risk-action">
                    Suggested action: {item.suggestedAction}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}