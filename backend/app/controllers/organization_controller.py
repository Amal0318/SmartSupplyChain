from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.organization_repository import OrganizationManagementRepository
from app.schemas.organization import (
    DepartmentCreate, DepartmentResponse,
    TeamCreate, TeamResponse,
    EmployeeProfileCreate, EmployeeProfileResponse,
    RoleCreate, RoleResponse,
    PermissionCreate, PermissionResponse,
    NotificationCreate, NotificationResponse,
    AdminDashboardMetrics
)
from app.controllers.auth_controller import get_current_user
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/organization-management", tags=["Organization & Governance Management"])


@router.get("/dashboard/metrics", response_model=AdminDashboardMetrics)
def get_admin_metrics(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.get_admin_metrics()


# Departments
@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(organization_id: Optional[str] = None, db: Session = Depends(get_db)):
    repo = OrganizationManagementRepository(db)
    return repo.get_departments(organization_id)


@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    dep_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.create_department(dep_in)


# Teams
@router.get("/teams", response_model=List[TeamResponse])
def list_teams(department_id: Optional[str] = None, db: Session = Depends(get_db)):
    repo = OrganizationManagementRepository(db)
    return repo.get_teams(department_id)


@router.post("/teams", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    team_in: TeamCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.create_team(team_in)


# Employee Profiles
@router.get("/employees", response_model=List[EmployeeProfileResponse])
def list_employees(search: Optional[str] = None, db: Session = Depends(get_db)):
    repo = OrganizationManagementRepository(db)
    return repo.get_employee_profiles(search)


@router.post("/employees", response_model=EmployeeProfileResponse, status_code=status.HTTP_201_CREATED)
def create_employee_profile(
    emp_in: EmployeeProfileCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.create_employee_profile(emp_in)


# Roles & Permissions
@router.get("/roles", response_model=List[RoleResponse])
def list_roles(db: Session = Depends(get_db)):
    repo = OrganizationManagementRepository(db)
    return repo.get_roles()


@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.create_role(role_in)


@router.get("/permissions", response_model=List[PermissionResponse])
def list_permissions(db: Session = Depends(get_db)):
    repo = OrganizationManagementRepository(db)
    return repo.get_permissions()


@router.post("/permissions", response_model=PermissionResponse, status_code=status.HTTP_201_CREATED)
def create_permission(
    perm_in: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.create_permission(perm_in)


# Notifications
@router.get("/notifications", response_model=List[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.get_user_notifications(current_user.id)


@router.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notif_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    repo = OrganizationManagementRepository(db)
    return repo.create_notification(notif_in)
