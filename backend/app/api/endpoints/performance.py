from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_role
from app.core.database import get_db
from app.models.models import Employee, PerformanceReview, User, UserRole
from app.schemas.schemas import PerformanceReviewCreate, PerformanceReviewResponse

router = APIRouter(prefix="/performance", tags=["Performance"])


@router.get("/", response_model=list[PerformanceReviewResponse])
def list_reviews(
    employee_id: int | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(PerformanceReview)
    if current_user.role == UserRole.EMPLOYEE:
        emp = db.query(Employee).filter(Employee.user_id == current_user.id).first()
        if emp:
            query = query.filter(PerformanceReview.employee_id == emp.id)
    elif employee_id:
        query = query.filter(PerformanceReview.employee_id == employee_id)
    return query.order_by(PerformanceReview.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=PerformanceReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    data: PerformanceReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(UserRole.ADMIN, UserRole.SENIOR_MANAGER)
    ),
):
    review = PerformanceReview(
        **data.model_dump(),
        reviewer_id=current_user.id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/{review_id}", response_model=PerformanceReviewResponse)
def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(PerformanceReview).filter(PerformanceReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review
