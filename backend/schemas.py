from pydantic import BaseModel, Field, ConfigDict


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    sku: str = Field(min_length=1, max_length=50)
    category: str = Field(min_length=1, max_length=100)
    unit: str = Field(default="pcs", max_length=20)
    reorder_level: int = Field(default=10, ge=0)


class ProductResponse(ProductCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class WarehouseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    location: str = Field(min_length=1, max_length=200)


class WarehouseResponse(WarehouseCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class StockResponse(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    quantity: int

    model_config = ConfigDict(from_attributes=True)

class ReceiptCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = Field(gt=0)
    note: str | None = Field(default=None, max_length=300)


class ReceiptResponse(BaseModel):
    message: str
    product_id: int
    warehouse_id: int
    quantity_received: int
    new_stock_quantity: int