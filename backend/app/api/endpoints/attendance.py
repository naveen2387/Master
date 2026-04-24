from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.models import Attendance, AttendanceStatus, Employee, User, UserRole
from app.schemas.schemas import AttendanceCheckIn, AttendanceCheckOut, AttendanceResponse

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/", response_model=list[AttendanceResponse])
def list_attendance(
    employee_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Attendance)
    if current_user.role == UserRole.EMPLOYEE:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if emp:
            query = query.filter(Attendance.employee_id == emp.id)
    elif employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    return query.order_by(Attendance.date.desc()).offset(skip).limit(limit).all()


@router.post("/check-in", response_model=AttendanceResponse)
def check_in(
    data: AttendanceCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    existing = (
        db.query(Attendance)
        .filter(Attendance.employee_id == data.employee_id, Attendance.date == today)
        .first()
    )
    if existing and existing.check_in:
        raise HTTPException(status_code=400, detail="Already checked in today")

    now = datetime.now(timezone.utc)
    if existing:
        existing.check_in = now
        existing.status = AttendanceStatus.PRESENT
        existing.notes = data.notes
        db.commit()
        db.refresh(existing)
        return existing

    record = Attendance(
        employee_id=data.employee_id,
        date=today,
        check_in=now,
        status=AttendanceStatus.PRESENT,
        notes=data.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    data: AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    record = (
        db.query(Attendance)
        .filter(Attendance.employee_id == data.employee_id, Attendance.date == today)
        .first()
    )
    if not record or not record.check_in:
        raise HTTPException(status_code=400, detail="No check-in record found for today")
    if record.check_out:
        raise HTTPException(status_code=400, detail="Already checked out today")

    now = datetime.now(timezone.utc)
    record.check_out = now
    diff = (now - record.check_in).total_seconds() / 3600
    record.hours_worked = round(diff, 2)
    db.commit()
    db.refresh(record)
    return record


@router.get("/today", response_model=list[AttendanceResponse])
def get_today_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.SENIOR_MANAGER, UserRole.HR_RECRUITER)
    ),
):
    today = date.today()
    return db.query(Attendance).filter(Attendance.date == today).all()
