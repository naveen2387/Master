"""Seed database with demo data."""
from datetime import date, datetime, timedelta, timezone
import random

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
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
    PayrollStatus,
    PerformanceReview,
    User,
    UserRole,
)


def seed_database(db: Session):
    if db.query(User).count() > 0:
        return

    # Create users
    users_data = [
        {"email": "admin@hrms.com", "full_name": "Admin User", "role": UserRole.ADMIN, "password": "admin123"},
        {"email": "manager@hrms.com", "full_name": "Sarah Johnson", "role": UserRole.SENIOR_MANAGER, "password": "manager123"},
        {"email": "hr@hrms.com", "full_name": "Mike Chen", "role": UserRole.HR_RECRUITER, "password": "hr123"},
        {"email": "john@hrms.com", "full_name": "John Smith", "role": UserRole.EMPLOYEE, "password": "emp123"},
        {"email": "jane@hrms.com", "full_name": "Jane Doe", "role": UserRole.EMPLOYEE, "password": "emp123"},
        {"email": "bob@hrms.com", "full_name": "Bob Wilson", "role": UserRole.EMPLOYEE, "password": "emp123"},
        {"email": "alice@hrms.com", "full_name": "Alice Brown", "role": UserRole.EMPLOYEE, "password": "emp123"},
        {"email": "charlie@hrms.com", "full_name": "Charlie Davis", "role": UserRole.EMPLOYEE, "password": "emp123"},
        {"email": "diana@hrms.com", "full_name": "Diana Martinez", "role": UserRole.EMPLOYEE, "password": "emp123"},
        {"email": "evan@hrms.com", "full_name": "Evan Taylor", "role": UserRole.EMPLOYEE, "password": "emp123"},
    ]

    users = []
    for u in users_data:
        user = User(
            email=u["email"],
            full_name=u["full_name"],
            role=u["role"],
            hashed_password=get_password_hash(u["password"]),
        )
        db.add(user)
        users.append(user)
    db.flush()

    # Departments
    departments_data = [
        {"name": "Engineering", "description": "Software development and technical operations"},
        {"name": "Human Resources", "description": "People management and recruitment"},
        {"name": "Marketing", "description": "Brand, content, and growth marketing"},
        {"name": "Finance", "description": "Financial planning, accounting, and payroll"},
        {"name": "Sales", "description": "Business development and client relations"},
        {"name": "Product", "description": "Product management and design"},
    ]

    departments = []
    for d in departments_data:
        dept = Department(**d, manager_id=users[1].id)
        db.add(dept)
        departments.append(dept)
    db.flush()

    # Employees (skip admin, manager, hr - they get profiles too)
    designations = [
        "Chief Technology Officer", "VP of Engineering", "HR Manager",
        "Senior Software Engineer", "Full Stack Developer", "Backend Developer",
        "Marketing Specialist", "Financial Analyst", "Product Designer", "Sales Executive",
    ]
    employees = []
    for i, user in enumerate(users):
        emp = Employee(
            user_id=user.id,
            employee_id=f"EMP{1001 + i:04d}",
            department_id=departments[i % len(departments)].id,
            designation=designations[i] if i < len(designations) else "Associate",
            phone=f"+1-555-{random.randint(1000, 9999)}",
            date_of_birth=date(1985 + (i % 15), (i % 12) + 1, (i % 28) + 1),
            date_of_joining=date(2022, (i % 12) + 1, (i % 28) + 1),
            salary=60000 + (i * 8000) + random.randint(0, 5000),
            skills="Python, React, SQL" if i % 2 == 0 else "Java, Angular, MongoDB",
        )
        db.add(emp)
        employees.append(emp)
    db.flush()

    # Attendance records for last 30 days
    today = date.today()
    for emp in employees:
        for day_offset in range(30):
            d = today - timedelta(days=day_offset)
            if d.weekday() >= 5:  # skip weekends
                continue
            status = random.choice(
                [AttendanceStatus.PRESENT] * 8 + [AttendanceStatus.LATE, AttendanceStatus.ABSENT]
            )
            check_in_hour = random.randint(8, 10)
            check_out_hour = random.randint(17, 19)
            att = Attendance(
                employee_id=emp.id,
                date=d,
                check_in=datetime(d.year, d.month, d.day, check_in_hour, 0, tzinfo=timezone.utc)
                if status != AttendanceStatus.ABSENT else None,
                check_out=datetime(d.year, d.month, d.day, check_out_hour, 0, tzinfo=timezone.utc)
                if status != AttendanceStatus.ABSENT else None,
                status=status,
                hours_worked=check_out_hour - check_in_hour if status != AttendanceStatus.ABSENT else 0,
            )
            db.add(att)

    # Leave requests
    leave_types = ["Annual", "Sick", "Personal", "Maternity", "Bereavement"]
    for emp in employees[:6]:
        for _ in range(random.randint(1, 3)):
            start = today + timedelta(days=random.randint(1, 60))
            leave = LeaveRequest(
                employee_id=emp.id,
                leave_type=random.choice(leave_types),
                start_date=start,
                end_date=start + timedelta(days=random.randint(1, 5)),
                reason="Personal reasons",
                status=random.choice([LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED]),
            )
            db.add(leave)

    # Payroll for last 3 months
    for emp in employees:
        for month_offset in range(3):
            m = today.month - month_offset
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
            basic = emp.salary / 12
            allowances = basic * 0.2
            deductions = basic * 0.05
            tax = basic * 0.1
            payroll = Payroll(
                employee_id=emp.id,
                month=m,
                year=y,
                basic_salary=round(basic, 2),
                allowances=round(allowances, 2),
                deductions=round(deductions, 2),
                tax=round(tax, 2),
                net_salary=round(basic + allowances - deductions - tax, 2),
                status=PayrollStatus.PAID if month_offset > 0 else PayrollStatus.PROCESSED,
            )
            db.add(payroll)

    # Performance reviews
    periods = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"]
    for emp in employees:
        for period in random.sample(periods, k=random.randint(1, 3)):
            review = PerformanceReview(
                employee_id=emp.id,
                reviewer_id=users[1].id,
                review_period=period,
                rating=round(random.uniform(2.5, 5.0), 1),
                goals_met=random.randint(3, 8),
                goals_total=8,
                strengths="Strong technical skills, good team player",
                improvements="Time management, documentation",
                comments="Consistent performer with growth potential",
            )
            db.add(review)

    # Job postings
    jobs_data = [
        {
            "title": "Senior Full Stack Developer",
            "description": "We are looking for an experienced Full Stack Developer to join our engineering team. You will design and build scalable web applications using modern technologies.",
            "requirements": "5+ years experience with React, Node.js, Python. Experience with cloud services (AWS/GCP). Strong understanding of databases (SQL and NoSQL). Excellent problem-solving skills.",
            "location": "San Francisco, CA (Hybrid)",
            "salary_range": "$130,000 - $170,000",
            "employment_type": "full-time",
        },
        {
            "title": "Machine Learning Engineer",
            "description": "Join our AI team to build and deploy machine learning models that power our intelligent HR features.",
            "requirements": "3+ years ML experience. Proficiency in Python, TensorFlow/PyTorch. Experience with NLP and deep learning. Masters or PhD preferred.",
            "location": "Remote",
            "salary_range": "$140,000 - $190,000",
            "employment_type": "full-time",
        },
        {
            "title": "Product Designer",
            "description": "Design intuitive and beautiful user interfaces for our HR management platform.",
            "requirements": "4+ years UX/UI design experience. Proficiency with Figma. Experience with design systems. Portfolio required.",
            "location": "New York, NY",
            "salary_range": "$110,000 - $150,000",
            "employment_type": "full-time",
        },
    ]

    jobs = []
    for j in jobs_data:
        job = JobPosting(**j, posted_by=users[2].id, department_id=departments[0].id)
        db.add(job)
        jobs.append(job)
    db.flush()

    # Sample applications
    applicants = [
        {
            "candidate_name": "Alex Rivera",
            "candidate_email": "alex.r@email.com",
            "resume_text": "Senior Software Engineer with 7+ years of experience in full stack development. Proficient in Python, JavaScript, React, Node.js, Django, FastAPI. Experience with AWS, Docker, Kubernetes. Bachelor's degree in Computer Science from MIT. Led a team of 5 developers. Built scalable microservices architecture.",
        },
        {
            "candidate_name": "Priya Sharma",
            "candidate_email": "priya.s@email.com",
            "resume_text": "Machine Learning Engineer with 4 years of experience. Skills: Python, TensorFlow, PyTorch, NLP, deep learning, data science, analytics. Master's degree in AI from Stanford. Published 3 research papers. Experience with large-scale ML systems at Google.",
        },
        {
            "candidate_name": "Marcus Johnson",
            "candidate_email": "marcus.j@email.com",
            "resume_text": "Full Stack Developer with 3 years experience. JavaScript, React, HTML, CSS, Node.js. Built several web applications. Bachelor's degree from UCLA. Passionate about clean code.",
        },
        {
            "candidate_name": "Emily Watson",
            "candidate_email": "emily.w@email.com",
            "resume_text": "Product Designer with 6 years of experience in UX/UI design. Expert in Figma, Adobe Creative Suite. Created design systems for 3 enterprise products. Master's in Human-Computer Interaction.",
        },
    ]

    for app_data in applicants:
        app = JobApplication(
            job_id=jobs[0].id,
            **app_data,
        )
        db.add(app)

    db.commit()
