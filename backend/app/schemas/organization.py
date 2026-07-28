from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DepartmentCreate(BaseModel):
    organization_id: str
    name: str
    code: str
    description: Optional[str] = None
    manager_id: Optional[str] = None


class DepartmentResponse(DepartmentCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TeamCreate(BaseModel):
    department_id: str
    name: str
    lead_id: Optional[str] = None


class TeamResponse(TeamCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeProfileCreate(BaseModel):
    user_id: str
    department_id: Optional[str] = None
    team_id: Optional[str] = None
    job_title: str
    employee_code: str
    phone: Optional[str] = None


class EmployeeProfileResponse(EmployeeProfileCreate):
    id: str
    hire_date: datetime

    model_config = ConfigDict(from_attributes=True)


class RoleCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class RoleResponse(RoleCreate):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PermissionCreate(BaseModel):
    name: str
    code: str
    resource: str
    action: str


class PermissionResponse(PermissionCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: str = "INFO"


class NotificationResponse(NotificationCreate):
    id: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminDashboardMetrics(BaseModel):
    total_organizations: int
    total_departments: int
    total_teams: int
    total_employees: int
    total_active_users: int
    unread_notifications: int
