from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User, Organization
from app.schemas.auth import UserCreate, OrganizationCreate
from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, user_in: UserCreate) -> User:
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            role=user_in.role,
            organization_id=user_in.organization_id
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).offset(skip).limit(limit).all()


class OrganizationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, org_in: OrganizationCreate) -> Organization:
        db_org = Organization(
            name=org_in.name,
            code=org_in.code,
            description=org_in.description
        )
        self.db.add(db_org)
        self.db.commit()
        self.db.refresh(db_org)
        return db_org

    def get_by_code(self, code: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.code == code).first()
