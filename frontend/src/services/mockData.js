export const mockProducts = [
  { id: 1, sku: 'STL-001', name: 'Steel Rods', category: 'Raw Material', reorderLevel: 50, totalStock: 120 },
  { id: 2, sku: 'MOU-002', name: 'Wireless Mouse', category: 'Electronics', reorderLevel: 20, totalStock: 8 },
  { id: 3, sku: 'CHR-003', name: 'Office Chair', category: 'Furniture', reorderLevel: 10, totalStock: 35 },
  { id: 4, sku: 'CBL-004', name: 'USB-C Cable', category: 'Electronics', reorderLevel: 100, totalStock: 0 },
]

export const mockWarehouses = [
  { id: 1, name: 'Main Warehouse', location: 'Hyderabad', totalStock: 480 },
  { id: 2, name: 'Production Floor', location: 'Hyderabad', totalStock: 65 },
  { id: 3, name: 'Warehouse 2', location: 'Chennai', totalStock: 210 },
]

export const productOptions = mockProducts.map(p => ({ id: p.id, label: `${p.sku} — ${p.name}` }))
export const warehouseOptions = mockWarehouses.map(w => ({ id: w.id, label: w.name }))

export const mockLedger = [
  { id: 1, product: 'Steel Rods', warehouse: 'Main Warehouse', operation: 'Receipt', change: 50, timestamp: '2026-09-26 09:12' },
  { id: 2, product: 'Wireless Mouse', warehouse: 'Warehouse 2', operation: 'Delivery', change: -12, timestamp: '2026-09-26 09:45' },
  { id: 3, product: 'Steel Rods', warehouse: 'Main Warehouse', operation: 'Transfer Out', change: -20, timestamp: '2026-09-26 10:03' },
  { id: 4, product: 'Steel Rods', warehouse: 'Production Floor', operation: 'Transfer In', change: 20, timestamp: '2026-09-26 10:03' },
  { id: 5, product: 'USB-C Cable', warehouse: 'Warehouse 2', operation: 'Adjustment', change: -3, timestamp: '2026-09-26 10:30' },
  { id: 6, product: 'Office Chair', warehouse: 'Main Warehouse', operation: 'Receipt', change: 35, timestamp: '2026-09-26 11:15' },
]

export function getDashboardStats() {
  const totalStock = mockProducts.reduce((sum, p) => sum + p.totalStock, 0)
  const totalSkus = mockProducts.length
  const lowStockCount = mockProducts.filter(p => p.totalStock <= p.reorderLevel).length
  const recentMovements = mockLedger.slice(-4).reverse()
  return { totalStock, totalSkus, lowStockCount, recentMovements }
}