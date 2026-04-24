from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.models import Employee, User, UserRole
from app.schemas.schemas import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("/", response_model=list[EmployeeResponse])
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    department_id: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Employee).options(
        joinedload(Employee.user), joinedload(Employee.department)
    )
    if department_id:
        query = query.filter(Employee.department_id == department_id)
    if search:
        query = query.join(User).filter(User.full_name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/me", response_model=EmployeeResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee = (
        db.query(Employee)
        .options(joinedload(Employee.user), joinedload(Employee.department))
        .filter(Employee.user_id == current_user.id)
        .first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return employee


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee = (
        db.query(Employee)
        .options(joinedload(Employee.user), joinedload(Employee.department))
        .filter(Employee.id == employee_id)
        .first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER)
    ),
):
    existing = db.query(Employee).filter(Employee.employee_id == data.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    employee = Employee(**data.model_dump())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER)
    ),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)
    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
