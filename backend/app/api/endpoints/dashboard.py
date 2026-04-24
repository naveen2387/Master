from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.models import (
    Attendance,
    AttendanceStatus,
    Department,
    Employee,
    JobApplication,
    JobPosting,
    LeaveRequest,
    LeaveStatus,
    Payroll,
    PerformanceReview,
    User,
    UserRole,
)
from app.schemas.schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    total_employees = db.query(func.count(Employee.id)).scalar() or 0
    total_departments = db.query(func.count(Department.id)).scalar() or 0

    present_today = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.date == today, Attendance.status == AttendanceStatus.PRESENT)
        .scalar() or 0
    )
    absent_today = max(0, total_employees - present_today)

    pending_leaves = (
        db.query(func.count(LeaveRequest.id))
        .filter(LeaveRequest.status == LeaveStatus.PENDING)
        .scalar() or 0
    )

    open_positions = (
        db.query(func.count(JobPosting.id))
        .filter(JobPosting.is_active.is_(True))
        .scalar() or 0
    )

    total_applications = db.query(func.count(JobApplication.id)).scalar() or 0

    avg_perf = db.query(func.avg(PerformanceReview.rating)).scalar() or 0.0

    current_month = today.month
    current_year = today.year
    payroll_this_month = (
        db.query(func.sum(Payroll.net_salary))
        .filter(Payroll.month == current_month, Payroll.year == current_year)
        .scalar() or 0.0
    )

    new_hires = (
        db.query(func.count(Employee.id))
        .filter(
            func.extract("month", Employee.date_of_joining) == current_month,
            func.extract("year", Employee.date_of_joining) == current_year,
        )
        .scalar() or 0
    )

    attendance_rate = round((present_today / total_employees * 100), 1) if total_employees > 0 else 0.0

    return DashboardStats(
        total_employees=total_employees,
        total_departments=total_departments,
        present_today=present_today,
        absent_today=absent_today,
        pending_leaves=pending_leaves,
        open_positions=open_positions,
        total_applications=total_applications,
        avg_performance=round(float(avg_perf), 2),
        payroll_this_month=float(payroll_this_month),
        new_hires_this_month=new_hires,
        attendance_rate=attendance_rate,
        turnover_rate=0.0,
    )


@router.get("/employee-stats")
def get_employee_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if not emp:
        return {"message": "No employee profile found"}

    today = date.today()
    attendance_this_month = (
        db.query(func.count(Attendance.id))
        .filter(
            Attendance.employee_id == emp.id,
            func.extract("month", Attendance.date) == today.month,
            func.extract("year", Attendance.date) == today.year,
        )
        .scalar() or 0
    )

    pending_leaves = (
        db.query(func.count(LeaveRequest.id))
        .filter(LeaveRequest.employee_id == emp.id, LeaveRequest.status == LeaveStatus.PENDING)
        .scalar() or 0
    )

    latest_review = (
        db.query(PerformanceReview)
        .filter(PerformanceReview.employee_id == emp.id)
        .order_by(PerformanceReview.created_at.desc())
        .first()
    )

    latest_payroll = (
        db.query(Payroll)
        .filter(Payroll.employee_id == emp.id)
        .order_by(Payroll.year.desc(), Payroll.month.desc())
        .first()
    )

    return {
        "employee_id": emp.employee_id,
        "designation": emp.designation,
        "department_id": emp.department_id,
        "attendance_this_month": attendance_this_month,
        "pending_leaves": pending_leaves,
        "latest_rating": latest_review.rating if latest_review else None,
        "latest_salary": latest_payroll.net_salary if latest_payroll else None,
    }
