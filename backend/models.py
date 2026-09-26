from sqlalchemy import String, Integer
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy import DateTime
from datetime import datetime


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    sku: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    unit: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pcs"
    )
    reorder_level: Mapped[int] = mapped_column(
        Integer, nullable=False, default=10
    )

class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    location: Mapped[str] = mapped_column(
        String(200), nullable=False
    )

class StockLevel(Base):
    __tablename__ = "stock_levels"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"), nullable=False
    )

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"), nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )

class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"), nullable=False
    )

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"), nullable=False
    )

    movement_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    note: Mapped[str | None] = mapped_column(
        String(300), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )