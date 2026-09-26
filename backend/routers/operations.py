from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import engine
from models import Product, Warehouse, StockLevel, StockMovement
from schemas import ReceiptCreate, ReceiptResponse

router = APIRouter(
    prefix="/api/operations",
    tags=["Operations"]
)


def get_db():
    with Session(engine) as db:
        yield db


@router.post("/receipts", response_model=ReceiptResponse, status_code=201)
def create_receipt(
    receipt: ReceiptCreate,
    db: Session = Depends(get_db)
):
    product = db.get(Product, receipt.product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    warehouse = db.get(Warehouse, receipt.warehouse_id)

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    stock = db.scalar(
        select(StockLevel).where(
            StockLevel.product_id == receipt.product_id,
            StockLevel.warehouse_id == receipt.warehouse_id
        )
    )

    if stock:
        stock.quantity += receipt.quantity
    else:
        stock = StockLevel(
            product_id=receipt.product_id,
            warehouse_id=receipt.warehouse_id,
            quantity=receipt.quantity
        )
        db.add(stock)

    movement = StockMovement(
        product_id=receipt.product_id,
        warehouse_id=receipt.warehouse_id,
        movement_type="RECEIPT",
        quantity=receipt.quantity,
        note=receipt.note
    )

    db.add(movement)
    db.commit()
    db.refresh(stock)

    return ReceiptResponse(
        message="Stock received successfully",
        product_id=receipt.product_id,
        warehouse_id=receipt.warehouse_id,
        quantity_received=receipt.quantity,
        new_stock_quantity=stock.quantity
    )