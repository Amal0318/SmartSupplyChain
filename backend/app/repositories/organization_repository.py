from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.organization import (
    Department, Team, EmployeeProfile, Role, Permission, Notification
)
from app.models.user import User, Organization, AuditLog
from app.schemas.organization import (
    DepartmentCreate, TeamCreate, EmployeeProfileCreate,
    RoleCreate, PermissionCreate, NotificationCreate, AdminDashboardMetrics
)


class OrganizationManagementRepository:
    def __init__(self, db: Session):
        self.db = db

    # Department CRUD
    def create_department(self, dep_in: DepartmentCreate) -> Department:
        db_dep = Department(**dep_in.model_dump())
        self.db.add(db_dep)
        self.db.commit()
        self.db.refresh(db_dep)
        return db_dep

    def get_departments(self, organization_id: Optional[str] = None) -> List[Department]:
        query = self.db.query(Department)
        if organization_id:
            query = query.filter(Department.organization_id == organization_id)
        return query.all()

    # Team CRUD
    def create_team(self, team_in: TeamCreate) -> Team:
        db_team = Team(**team_in.model_dump())
        self.db.add(db_team)
        self.db.commit()
        self.db.refresh(db_team)
        return db_team

    def get_teams(self, department_id: Optional[str] = None) -> List[Team]:
        query = self.db.query(Team)
        if department_id:
            query = query.filter(Team.department_id == department_id)
        return query.all()

    # Employee Profile CRUD
    def create_employee_profile(self, emp_in: EmployeeProfileCreate) -> EmployeeProfile:
        db_emp = EmployeeProfile(**emp_in.model_dump())
        self.db.add(db_emp)
        self.db.commit()
        self.db.refresh(db_emp)
        return db_emp

    def get_employee_profiles(self, search: Optional[str] = None) -> List[EmployeeProfile]:
        query = self.db.query(EmployeeProfile)
        if search:
            query = query.filter(
                (EmployeeProfile.job_title.ilike(f"%{search}%")) |
                (EmployeeProfile.employee_code.ilike(f"%{search}%"))
            )
        return query.all()

    # Role & Permission CRUD
    def create_role(self, role_in: RoleCreate) -> Role:
        db_role = Role(**role_in.model_dump())
        self.db.add(db_role)
        self.db.commit()
        self.db.refresh(db_role)
        return db_role

    def get_roles(self) -> List[Role]:
        return self.db.query(Role).all()

    def create_permission(self, perm_in: PermissionCreate) -> Permission:
        db_perm = Permission(**perm_in.model_dump())
        self.db.add(db_perm)
        self.db.commit()
        self.db.refresh(db_perm)
        return db_perm

    def get_permissions(self) -> List[Permission]:
        return self.db.query(Permission).all()

    # Notification Centre
    def create_notification(self, notif_in: NotificationCreate) -> Notification:
        db_notif = Notification(**notif_in.model_dump())
        self.db.add(db_notif)
        self.db.commit()
        self.db.refresh(db_notif)
        return db_notif

    def get_user_notifications(self, user_id: str) -> List[Notification]:
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    # Admin Dashboard Metrics
    def get_admin_metrics(self) -> AdminDashboardMetrics:
        return AdminDashboardMetrics(
            total_organizations=self.db.query(Organization).count(),
            total_departments=self.db.query(Department).count(),
            total_teams=self.db.query(Team).count(),
            total_employees=self.db.query(EmployeeProfile).count(),
            total_active_users=self.db.query(User).filter(User.is_active == True).count(),
            unread_notifications=self.db.query(Notification).filter(Notification.is_read == False).count()
        )
