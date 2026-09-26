from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from database import engine
from models import StockMovement
from schemas import MovementResponse

router = APIRouter(
    prefix="/api/movements",
    tags=["Movements"]
)


def get_db():
    with Session(engine) as db:
        yield db


@router.get("/", response_model=list[MovementResponse])
def list_movements(db: Session = Depends(get_db)):
    return db.scalars(
        select(StockMovement).order_by(StockMovement.created_at.desc())
    ).all()