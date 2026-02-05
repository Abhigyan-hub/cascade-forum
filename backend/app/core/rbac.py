"""
Role-Based Access Control (RBAC) dependencies
"""
from typing import List
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User


class RoleChecker:
    """RBAC dependency factory"""
    
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles
    
    def __call__(
        self,
        current_user_id: str = Depends(get_current_user_id),
        db: Session = Depends(get_db)
    ) -> User:
        user = db.query(User).filter(User.id == current_user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user


# Role checkers
require_client = RoleChecker(["client", "admin", "developer"])
require_admin = RoleChecker(["admin", "developer"])
require_developer = RoleChecker(["developer"])
