from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.user_repository import UserRepository, OrganizationRepository
from app.schemas.auth import UserCreate, UserResponse, Token, LoginCredentials, OrganizationCreate, OrganizationResponse
from app.core.security import verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login-token")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserResponse:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive or non-existent user account")
    return UserResponse.model_validate(user)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    existing_user = repo.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="A user account with this email address already exists.")
    return repo.create(user_in)


@router.post("/login", response_model=Token)
def login(credentials: LoginCredentials, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password",
        )
    access_token = create_access_token(subject=user.id)
    user_resp = UserResponse.model_validate(user)
    return Token(access_token=access_token, user=user_resp)


@router.post("/login-token", response_model=Token)
def login_token_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
        )
    access_token = create_access_token(subject=user.id)
    user_resp = UserResponse.model_validate(user)
    return Token(access_token=access_token, user=user_resp)


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.post("/organization", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(org_in: OrganizationCreate, db: Session = Depends(get_db)):
    repo = OrganizationRepository(db)
    if repo.get_by_code(org_in.code):
        raise HTTPException(status_code=400, detail="Organization code already exists.")
    return repo.create(org_in)
