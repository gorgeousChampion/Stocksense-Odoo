from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import engine
from models import Warehouse
from schemas import WarehouseCreate, WarehouseResponse

router = APIRouter(
    prefix="/api/warehouses",
    tags=["Warehouses"]
)


def get_db():
    with Session(engine) as db:
        yield db


@router.get("/", response_model=list[WarehouseResponse])
def list_warehouses(db: Session = Depends(get_db)):
    return db.scalars(
        select(Warehouse).order_by(Warehouse.id)
    ).all()


@router.post("/", response_model=WarehouseResponse, status_code=201)
def create_warehouse(
    warehouse: WarehouseCreate,
    db: Session = Depends(get_db)
):
    new_warehouse = Warehouse(**warehouse.model_dump())

    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)

    return new_warehouse