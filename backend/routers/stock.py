from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import engine
from models import StockLevel
from schemas import StockResponse

router = APIRouter(
    prefix="/api/stock",
    tags=["Stock"]
)


def get_db():
    with Session(engine) as db:
        yield db


@router.get("/", response_model=list[StockResponse])
def list_stock(db: Session = Depends(get_db)):
    return db.scalars(
        select(StockLevel).order_by(StockLevel.id)
    ).all()