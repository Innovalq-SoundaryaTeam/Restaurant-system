from fastapi import Depends, HTTPException
from app.core.security import get_current_user


def admin_required(user=Depends(get_current_user)):

    if user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user
