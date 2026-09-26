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
  { id: 1, product: 'Steel Rods', sku: 'STL-001', warehouse: 'Main Warehouse', category: 'Raw Material', operation: 'Receipt', status: 'Done', change: 50, timestamp: '2026-09-26 09:12' },
  { id: 2, product: 'Wireless Mouse', sku: 'MOU-002', warehouse: 'Warehouse 2', category: 'Electronics', operation: 'Delivery', status: 'Done', change: -12, timestamp: '2026-09-26 09:45' },
  { id: 3, product: 'Steel Rods', sku: 'STL-001', warehouse: 'Main Warehouse', category: 'Raw Material', operation: 'Internal', status: 'Done', change: -20, timestamp: '2026-09-26 10:03' },
  { id: 4, product: 'Steel Rods', sku: 'STL-001', warehouse: 'Production Floor', category: 'Raw Material', operation: 'Internal', status: 'Done', change: 20, timestamp: '2026-09-26 10:03' },
  { id: 5, product: 'USB-C Cable', sku: 'CBL-004', warehouse: 'Warehouse 2', category: 'Electronics', operation: 'Adjustment', status: 'Done', change: -3, timestamp: '2026-09-26 10:30' },
  { id: 6, product: 'Office Chair', sku: 'CHR-003', warehouse: 'Main Warehouse', category: 'Furniture', operation: 'Receipt', status: 'Waiting', change: 35, timestamp: '2026-09-26 11:15' },
  { id: 7, product: 'Office Chair', sku: 'CHR-003', warehouse: 'Main Warehouse', category: 'Furniture', operation: 'Receipt', status: 'Draft', change: 10, timestamp: '2026-09-26 11:40' },
  { id: 8, product: 'Wireless Mouse', sku: 'MOU-002', warehouse: 'Warehouse 2', category: 'Electronics', operation: 'Delivery', status: 'Cancelled', change: -5, timestamp: '2026-09-26 11:52' },
]

export const filterOptions = {
  documentTypes: ['Receipt', 'Delivery', 'Internal', 'Adjustment'],
  statuses: ['Draft', 'Waiting', 'Ready', 'Done', 'Cancelled'],
  warehouses: [...new Set(mockLedger.map(e => e.warehouse))],
  categories: [...new Set(mockLedger.map(e => e.category))],
}

export function getDashboardStats() {
  const totalStock = mockProducts.reduce((sum, p) => sum + p.totalStock, 0)
  const totalSkus = mockProducts.length
  const lowStockCount = mockProducts.filter(p => p.totalStock <= p.reorderLevel).length
  const recentMovements = mockLedger.slice(-4).reverse()
  return { totalStock, totalSkus, lowStockCount, recentMovements }
}

export const mockRiskItems = [
  {
    id: 1,
    product: 'Wireless Mouse',
    sku: 'MOU-002',
    warehouse: 'Warehouse 2',
    currentStock: 8,
    reorderLevel: 20,
    dailyUsage: 3,
    severity: 'critical',
    reason: 'Stock is below reorder level and depleting fast',
    suggestedAction: 'Replenish 40 units, or transfer 15 units from Main Warehouse',
  },
  {
    id: 2,
    product: 'USB-C Cable',
    sku: 'CBL-004',
    warehouse: 'Warehouse 2',
    currentStock: 0,
    reorderLevel: 100,
    dailyUsage: 5,
    severity: 'critical',
    reason: 'Out of stock, active demand recorded in ledger',
    suggestedAction: 'Replenish immediately, 100 units recommended',
  },
  {
    id: 3,
    product: 'Office Chair',
    sku: 'CHR-003',
    warehouse: 'Main Warehouse',
    currentStock: 35,
    reorderLevel: 10,
    dailyUsage: 2,
    severity: 'watch',
    reason: 'Above reorder level but usage trending upward',
    suggestedAction: 'No action needed yet, monitor next 7 days',
  },
]

export function estimateDaysRemaining(item) {
  if (item.dailyUsage <= 0) return null
  return Math.floor(item.currentStock / item.dailyUsage)
}