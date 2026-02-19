from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.security import require_roles
from app.models.settings import RestaurantProfile
from app.schemas.settings import RestaurantProfileCreate
from app.models.staff import Staff

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)


# ===============================
# GET RESTAURANT PROFILE
# ===============================

@router.get("/restaurant-profile")
def get_profile(
    db: Session = Depends(get_db)
):
    profile = db.query(RestaurantProfile).first()
    return profile


# ===============================
# CREATE / UPDATE PROFILE
# ADMIN ONLY 🔐
# ===============================

@router.post("/restaurant-profile")
def update_profile(
    data: RestaurantProfileCreate,
    db: Session = Depends(get_db),
    admin: Staff = Depends(require_roles("admin"))
):

    profile = db.query(RestaurantProfile).first()

    if profile:
        for key, value in data.dict().items():
            setattr(profile, key, value)
    else:
        profile = RestaurantProfile(**data.dict())
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return profile
