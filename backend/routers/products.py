from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from database import engine
from models import Product, StockLevel
from schemas import ProductCreate, ProductResponse

router = APIRouter(prefix="/api/products", tags=["Products"])


def get_db():
    with Session(engine) as db:
        yield db


@router.get("/", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.scalars(
        select(Product)
        .where(Product.is_deleted == False)
        .order_by(Product.id)
    ).all()


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    existing = db.scalar(
        select(Product).where(Product.sku == product.sku)
    )

    if existing and not existing.is_deleted:
        raise HTTPException(
            status_code=409,
            detail="SKU already exists"
        )

    if existing and existing.is_deleted:
        existing.is_deleted = False
        existing.name = product.name
        existing.category = product.category
        existing.unit = product.unit
        existing.reorder_level = product.reorder_level

        db.commit()
        db.refresh(existing)

        return existing

    new_product = Product(
        **product.model_dump(),
        is_deleted=False
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.get(Product, product_id)

    if not product or product.is_deleted:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.is_deleted = True

    db.execute(
        delete(StockLevel).where(
            StockLevel.product_id == product_id
        )
    )

    db.commit()

    return {
        "message": "Product deleted successfully"
    }