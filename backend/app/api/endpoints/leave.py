from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.models import Employee, LeaveRequest, LeaveStatus, User, UserRole
from app.schemas.schemas import LeaveRequestCreate, LeaveRequestResponse

router = APIRouter(prefix="/leaves", tags=["Leave Management"])


@router.get("/", response_model=list[LeaveRequestResponse])
def list_leaves(
    status_filter: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(LeaveRequest)
    if current_user.role == UserRole.EMPLOYEE:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if emp:
            query = query.filter(LeaveRequest.employee_id == emp.id)
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
    return query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
def create_leave_request(
    data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    leave = LeaveRequest(
        employee_id=emp.id,
        **data.model_dump(),
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


@router.put("/{leave_id}/approve", response_model=LeaveRequestResponse)
def approve_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.SENIOR_MANAGER, UserRole.HR_RECRUITER)
    ),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    leave.status = LeaveStatus.APPROVED
    leave.approved_by = current_user.id
    db.commit()
    db.refresh(leave)
    return leave


@router.put("/{leave_id}/reject", response_model=LeaveRequestResponse)
def reject_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.SENIOR_MANAGER, UserRole.HR_RECRUITER)
    ),
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    leave.status = LeaveStatus.REJECTED
    leave.approved_by = current_user.id
    db.commit()
    db.refresh(leave)
    return leave
