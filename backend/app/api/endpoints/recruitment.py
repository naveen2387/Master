from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.models import (
    ApplicationStatus,
    JobApplication,
    JobPosting,
    User,
    UserRole,
)
from app.schemas.schemas import (
    JobApplicationCreate,
    JobApplicationResponse,
    JobPostingCreate,
    JobPostingResponse,
)
from app.services.ai_screening import screen_resume

router = APIRouter(prefix="/recruitment", tags=["Recruitment"])


# --- Job Postings ---
@router.get("/jobs", response_model=list[JobPostingResponse])
def list_jobs(
    active_only: bool = True,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(JobPosting)
    if active_only:
        query = query.filter(JobPosting.is_active.is_(True))
    return query.order_by(JobPosting.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/jobs", response_model=JobPostingResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    data: JobPostingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER)
    ),
):
    job = JobPosting(**data.model_dump(), posted_by=current_user.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get("/jobs/{job_id}", response_model=JobPostingResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.put("/jobs/{job_id}/close", response_model=JobPostingResponse)
def close_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER)
    ),
):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.is_active = False
    db.commit()
    db.refresh(job)
    return job


# --- Applications ---
@router.get("/applications", response_model=list[JobApplicationResponse])
def list_applications(
    job_id: int | None = None,
    status_filter: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER, UserRole.SENIOR_MANAGER)
    ),
):
    query = db.query(JobApplication)
    if job_id:
        query = query.filter(JobApplication.job_id == job_id)
    if status_filter:
        query = query.filter(JobApplication.status == status_filter)
    return query.order_by(JobApplication.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/applications", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    data: JobApplicationCreate,
    db: Session = Depends(get_db),
):
    job = db.query(JobPosting).filter(JobPosting.id == data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    if not job.is_active:
        raise HTTPException(status_code=400, detail="Job posting is closed")

    application = JobApplication(**data.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.post("/applications/{app_id}/screen", response_model=JobApplicationResponse)
def screen_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER)
    ),
):
    application = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    job = db.query(JobPosting).filter(JobPosting.id == application.job_id).first()
    result = screen_resume(
        resume_text=application.resume_text or "",
        job_description=job.description if job else "",
        job_requirements=job.requirements if job else "",
    )
    application.ai_score = result["score"]
    application.ai_summary = result["summary"]
    application.ai_strengths = result["strengths"]
    application.ai_weaknesses = result["weaknesses"]
    application.status = ApplicationStatus.SCREENING
    db.commit()
    db.refresh(application)
    return application


@router.put("/applications/{app_id}/status")
def update_application_status(
    app_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.HR_RECRUITER)
    ),
):
    application = db.query(JobApplication).filter(JobApplication.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = ApplicationStatus(new_status)
    db.commit()
    db.refresh(application)
    return application
