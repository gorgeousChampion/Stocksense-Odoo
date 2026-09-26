from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from database import engine
from models import Product
from schemas import ProductCreate, ProductResponse

router = APIRouter(prefix="/api/products", tags=["Products"])


def get_db():
    with Session(engine) as db:
        yield db


@router.get("/", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.scalars(select(Product).order_by(Product.id)).all()


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.scalar(
        select(Product).where(Product.sku == product.sku)
    )
    if existing:
        raise HTTPException(status_code=409, detail="SKU already exists")

    new_product = Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product