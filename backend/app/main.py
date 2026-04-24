from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.api.endpoints import (
    auth,
    attendance,
    dashboard,
    departments,
    employees,
    leave,
    payroll,
    performance,
    recruitment,
)
from app.seed import seed_database

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI-Powered Human Resource Management System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
for router_module in [
    auth, employees, departments, attendance,
    leave, payroll, performance, recruitment, dashboard,
]:
    app.include_router(router_module.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": settings.VERSION}
