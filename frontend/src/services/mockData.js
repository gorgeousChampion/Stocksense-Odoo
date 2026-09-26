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