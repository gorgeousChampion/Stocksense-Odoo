from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import engine
from models import Product, Warehouse, StockLevel, StockMovement
from schemas import (
    ReceiptCreate,
    ReceiptResponse,
    DeliveryCreate,
    DeliveryResponse,
    TransferCreate,
    TransferResponse,
    AdjustmentCreate,
    AdjustmentResponse
)
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

@router.post("/deliveries", response_model=DeliveryResponse, status_code=201)
def create_delivery(
    delivery: DeliveryCreate,
    db: Session = Depends(get_db)
):
    product = db.get(Product, delivery.product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    warehouse = db.get(Warehouse, delivery.warehouse_id)

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    stock = db.scalar(
        select(StockLevel).where(
            StockLevel.product_id == delivery.product_id,
            StockLevel.warehouse_id == delivery.warehouse_id
        )
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="No stock record found"
        )

    if stock.quantity < delivery.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient stock"
        )

    stock.quantity -= delivery.quantity

    movement = StockMovement(
        product_id=delivery.product_id,
        warehouse_id=delivery.warehouse_id,
        movement_type="DELIVERY",
        quantity=delivery.quantity,
        note=delivery.note
    )

    db.add(movement)
    db.commit()
    db.refresh(stock)

    return DeliveryResponse(
        message="Stock delivered successfully",
        product_id=delivery.product_id,
        warehouse_id=delivery.warehouse_id,
        quantity_delivered=delivery.quantity,
        new_stock_quantity=stock.quantity
    )

@router.post("/transfers", response_model=TransferResponse, status_code=201)
def create_transfer(
    transfer: TransferCreate,
    db: Session = Depends(get_db)
):
    if transfer.source_warehouse_id == transfer.destination_warehouse_id:
        raise HTTPException(
            status_code=400,
            detail="Source and destination warehouses must be different"
        )

    product = db.get(Product, transfer.product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    source_warehouse = db.get(Warehouse, transfer.source_warehouse_id)

    if not source_warehouse:
        raise HTTPException(
            status_code=404,
            detail="Source warehouse not found"
        )

    destination_warehouse = db.get(
        Warehouse,
        transfer.destination_warehouse_id
    )

    if not destination_warehouse:
        raise HTTPException(
            status_code=404,
            detail="Destination warehouse not found"
        )

    source_stock = db.scalar(
        select(StockLevel).where(
            StockLevel.product_id == transfer.product_id,
            StockLevel.warehouse_id == transfer.source_warehouse_id
        )
    )

    if not source_stock:
        raise HTTPException(
            status_code=404,
            detail="No source stock record found"
        )

    if source_stock.quantity < transfer.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient source stock"
        )

    destination_stock = db.scalar(
        select(StockLevel).where(
            StockLevel.product_id == transfer.product_id,
            StockLevel.warehouse_id == transfer.destination_warehouse_id
        )
    )

    source_stock.quantity -= transfer.quantity

    if destination_stock:
        destination_stock.quantity += transfer.quantity
    else:
        destination_stock = StockLevel(
            product_id=transfer.product_id,
            warehouse_id=transfer.destination_warehouse_id,
            quantity=transfer.quantity
        )
        db.add(destination_stock)

    source_movement = StockMovement(
        product_id=transfer.product_id,
        warehouse_id=transfer.source_warehouse_id,
        movement_type="TRANSFER_OUT",
        quantity=transfer.quantity,
        note=transfer.note
    )

    destination_movement = StockMovement(
        product_id=transfer.product_id,
        warehouse_id=transfer.destination_warehouse_id,
        movement_type="TRANSFER_IN",
        quantity=transfer.quantity,
        note=transfer.note
    )

    db.add(source_movement)
    db.add(destination_movement)

    db.commit()
    db.refresh(source_stock)
    db.refresh(destination_stock)

    return TransferResponse(
        message="Stock transferred successfully",
        product_id=transfer.product_id,
        source_warehouse_id=transfer.source_warehouse_id,
        destination_warehouse_id=transfer.destination_warehouse_id,
        quantity_transferred=transfer.quantity,
        source_new_stock_quantity=source_stock.quantity,
        destination_new_stock_quantity=destination_stock.quantity
    )

@router.post("/adjustments", response_model=AdjustmentResponse, status_code=201)
def create_adjustment(
    adjustment: AdjustmentCreate,
    db: Session = Depends(get_db)
):
    product = db.get(Product, adjustment.product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    warehouse = db.get(Warehouse, adjustment.warehouse_id)

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    stock = db.scalar(
        select(StockLevel).where(
            StockLevel.product_id == adjustment.product_id,
            StockLevel.warehouse_id == adjustment.warehouse_id
        )
    )

    if not stock:
        if adjustment.quantity < 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot reduce stock that does not exist"
            )

        stock = StockLevel(
            product_id=adjustment.product_id,
            warehouse_id=adjustment.warehouse_id,
            quantity=0
        )
        db.add(stock)

    new_quantity = stock.quantity + adjustment.quantity

    if new_quantity < 0:
        raise HTTPException(
            status_code=400,
            detail="Adjustment would make stock negative"
        )

    stock.quantity = new_quantity

    movement = StockMovement(
        product_id=adjustment.product_id,
        warehouse_id=adjustment.warehouse_id,
        movement_type="ADJUSTMENT",
        quantity=adjustment.quantity,
        note=adjustment.note
    )

    db.add(movement)
    db.commit()
    db.refresh(stock)

    return AdjustmentResponse(
        message="Stock adjusted successfully",
        product_id=adjustment.product_id,
        warehouse_id=adjustment.warehouse_id,
        quantity_adjusted=adjustment.quantity,
        new_stock_quantity=stock.quantity
    )