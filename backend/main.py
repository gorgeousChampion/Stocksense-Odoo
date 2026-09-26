from fastapi import FastAPI
from sqlalchemy import text
from database import engine
from models import Base
from routers.warehouses import router as warehouses_router
from routers.products import router as products_router
from routers.stock import router as stock_router
from routers.operations import router as operations_router
from routers.movements import router as movements_router

app = FastAPI(title="StockSense API")

app.include_router(products_router)
app.include_router(warehouses_router)
app.include_router(stock_router)
app.include_router(operations_router)
app.include_router(movements_router)

Base.metadata.create_all(bind=engine)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/health/db")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database()"))
        return {"database": result.scalar(), "status": "connected"}