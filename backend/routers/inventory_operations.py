from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from database import engine
from models import (
    InventoryOperation,
    Product,
    Warehouse,
    StockLevel,
    StockMovement
)
from schemas import (
    InventoryOperationCreate,
    InventoryOperationResponse
)

router = APIRouter(
    prefix="/api/inventory-operations",
    tags=["Inventory Operations"]
)


def get_db():
    with Session(engine) as db:
        yield db


@router.post(
    "/",
    response_model=InventoryOperationResponse,
    status_code=201
)
def create_inventory_operation(
    operation: InventoryOperationCreate,
    db: Session = Depends(get_db)
):
    product = db.get(Product, operation.product_id)

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    warehouse = db.get(Warehouse, operation.warehouse_id)

    if not warehouse:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found"
        )

    new_operation = InventoryOperation(
        operation_type=operation.operation_type,
        product_id=operation.product_id,
        warehouse_id=operation.warehouse_id,
        quantity=operation.quantity,
        status="Waiting",
        due_date=operation.due_date
    )

    db.add(new_operation)
    db.commit()
    db.refresh(new_operation)

    return new_operation


@router.get(
    "/",
    response_model=list[InventoryOperationResponse]
)
def get_inventory_operations(
    db: Session = Depends(get_db)
):
    operations = db.scalars(
        select(InventoryOperation)
        .order_by(InventoryOperation.created_at.desc())
    ).all()

    return operations


@router.post(
    "/{operation_id}/validate",
    response_model=InventoryOperationResponse
)
def validate_inventory_operation(
    operation_id: int,
    db: Session = Depends(get_db)
):
    operation = db.get(
        InventoryOperation,
        operation_id
    )

    if not operation:
        raise HTTPException(
            status_code=404,
            detail="Operation not found"
        )

    if operation.status != "Waiting":
        raise HTTPException(
            status_code=400,
            detail="Only waiting operations can be validated"
        )

    stock = db.scalar(
        select(StockLevel).where(
            StockLevel.product_id == operation.product_id,
            StockLevel.warehouse_id == operation.warehouse_id
        )
    )

    if operation.operation_type == "RECEIPT":

        if stock:
            stock.quantity += operation.quantity
        else:
            stock = StockLevel(
                product_id=operation.product_id,
                warehouse_id=operation.warehouse_id,
                quantity=operation.quantity
            )
            db.add(stock)

        movement = StockMovement(
            product_id=operation.product_id,
            warehouse_id=operation.warehouse_id,
            movement_type="RECEIPT",
            quantity=operation.quantity,
            note=f"Validated operation #{operation.id}"
        )

        db.add(movement)

    elif operation.operation_type == "DELIVERY":

        if not stock:
            raise HTTPException(
                status_code=400,
                detail="No stock available"
            )

        if stock.quantity < operation.quantity:
            raise HTTPException(
                status_code=400,
                detail="Insufficient stock"
            )

        stock.quantity -= operation.quantity

        movement = StockMovement(
            product_id=operation.product_id,
            warehouse_id=operation.warehouse_id,
            movement_type="DELIVERY",
            quantity=operation.quantity,
            note=f"Validated operation #{operation.id}"
        )

        db.add(movement)

    operation.status = "Done"

    db.commit()
    db.refresh(operation)

    return operation


@router.post(
    "/{operation_id}/cancel",
    response_model=InventoryOperationResponse
)
def cancel_inventory_operation(
    operation_id: int,
    db: Session = Depends(get_db)
):
    operation = db.get(
        InventoryOperation,
        operation_id
    )

    if not operation:
        raise HTTPException(
            status_code=404,
            detail="Operation not found"
        )

    if operation.status != "Waiting":
        raise HTTPException(
            status_code=400,
            detail="Only waiting operations can be canceled"
        )

    operation.status = "Canceled"

    db.commit()
    db.refresh(operation)

    return operation