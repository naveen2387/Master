from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.models import Employee, Payroll, PayrollStatus, User, UserRole
from app.schemas.schemas import PayrollCreate, PayrollResponse

router = APIRouter(prefix="/payroll", tags=["Payroll"])


@router.get("/", response_model=list[PayrollResponse])
def list_payroll(
    employee_id: int | None = None,
    month: int | None = None,
    year: int | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Payroll)
    if current_user.role == UserRole.EMPLOYEE:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if emp:
            query = query.filter(Payroll.employee_id == emp.id)
    elif employee_id:
        query = query.filter(Payroll.employee_id == employee_id)
    if month:
        query = query.filter(Payroll.month == month)
    if year:
        query = query.filter(Payroll.year == year)
    return query.order_by(Payroll.year.desc(), Payroll.month.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=PayrollResponse, status_code=status.HTTP_201_CREATED)
def create_payroll(
    data: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER)
    ),
):
    existing = (
        db.query(Payroll)
        .filter(
            Payroll.employee_id == data.employee_id,
            Payroll.month == data.month,
            Payroll.year == data.year,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Payroll already exists for this period")

    net_salary = data.basic_salary + data.allowances - data.deductions - data.tax
    payroll = Payroll(
        **data.model_dump(),
        net_salary=net_salary,
    )
    db.add(payroll)
    db.commit()
    db.refresh(payroll)
    return payroll


@router.put("/{payroll_id}/process", response_model=PayrollResponse)
def process_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    payroll.status = PayrollStatus.PROCESSED
    db.commit()
    db.refresh(payroll)
    return payroll


@router.put("/{payroll_id}/pay", response_model=PayrollResponse)
def mark_paid(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    payroll = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll record not found")
    payroll.status = PayrollStatus.PAID
    payroll.paid_date = date.today()
    db.commit()
    db.refresh(payroll)
    return payroll
