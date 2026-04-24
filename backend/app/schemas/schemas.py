from datetime import date, datetime

from pydantic import BaseModel, EmailStr


# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: int | None = None
    role: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


# --- User ---
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "employee"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    avatar_url: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# --- Department ---
class DepartmentBase(BaseModel):
    name: str
    description: str | None = None
    manager_id: int | None = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# --- Employee ---
class EmployeeBase(BaseModel):
    employee_id: str
    department_id: int | None = None
    designation: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    date_of_joining: date | None = None
    salary: float = 0.0
    address: str | None = None
    emergency_contact: str | None = None
    skills: str | None = None


class EmployeeCreate(EmployeeBase):
    user_id: int


class EmployeeUpdate(BaseModel):
    department_id: int | None = None
    designation: str | None = None
    phone: str | None = None
    date_of_birth: date | None = None
    salary: float | None = None
    address: str | None = None
    emergency_contact: str | None = None
    skills: str | None = None


class EmployeeResponse(EmployeeBase):
    id: int
    user_id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    user: UserResponse | None = None
    department: DepartmentResponse | None = None

    class Config:
        from_attributes = True


# --- Attendance ---
class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str = "present"
    notes: str | None = None


class AttendanceCheckIn(BaseModel):
    employee_id: int
    notes: str | None = None


class AttendanceCheckOut(BaseModel):
    employee_id: int


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    check_in: datetime | None = None
    check_out: datetime | None = None
    status: str
    hours_worked: float
    notes: str | None = None

    class Config:
        from_attributes = True


# --- Leave Request ---
class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveRequestResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: str | None = None
    status: str
    approved_by: int | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# --- Payroll ---
class PayrollCreate(BaseModel):
    employee_id: int
    month: int
    year: int
    basic_salary: float
    allowances: float = 0.0
    deductions: float = 0.0
    tax: float = 0.0


class PayrollResponse(BaseModel):
    id: int
    employee_id: int
    month: int
    year: int
    basic_salary: float
    allowances: float
    deductions: float
    tax: float
    net_salary: float
    status: str
    paid_date: date | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# --- Performance Review ---
class PerformanceReviewCreate(BaseModel):
    employee_id: int
    review_period: str
    rating: float
    goals_met: int = 0
    goals_total: int = 0
    strengths: str | None = None
    improvements: str | None = None
    comments: str | None = None


class PerformanceReviewResponse(BaseModel):
    id: int
    employee_id: int
    reviewer_id: int
    review_period: str
    rating: float
    goals_met: int
    goals_total: int
    strengths: str | None = None
    improvements: str | None = None
    comments: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# --- Job Posting ---
class JobPostingCreate(BaseModel):
    title: str
    department_id: int | None = None
    description: str
    requirements: str | None = None
    location: str | None = None
    salary_range: str | None = None
    employment_type: str = "full-time"
    closing_date: date | None = None


class JobPostingResponse(BaseModel):
    id: int
    title: str
    department_id: int | None = None
    description: str
    requirements: str | None = None
    location: str | None = None
    salary_range: str | None = None
    employment_type: str
    is_active: bool
    posted_by: int
    created_at: datetime | None = None
    closing_date: date | None = None

    class Config:
        from_attributes = True


# --- Job Application ---
class JobApplicationCreate(BaseModel):
    job_id: int
    candidate_name: str
    candidate_email: str
    candidate_phone: str | None = None
    resume_text: str | None = None
    cover_letter: str | None = None


class JobApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_name: str
    candidate_email: str
    candidate_phone: str | None = None
    resume_text: str | None = None
    cover_letter: str | None = None
    status: str
    ai_score: float | None = None
    ai_summary: str | None = None
    ai_strengths: str | None = None
    ai_weaknesses: str | None = None
    screening_notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


# --- Notification ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    notification_type: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True


# --- Dashboard ---
class DashboardStats(BaseModel):
    total_employees: int = 0
    total_departments: int = 0
    present_today: int = 0
    absent_today: int = 0
    pending_leaves: int = 0
    open_positions: int = 0
    total_applications: int = 0
    avg_performance: float = 0.0
    payroll_this_month: float = 0.0
    new_hires_this_month: int = 0
    attendance_rate: float = 0.0
    turnover_rate: float = 0.0
