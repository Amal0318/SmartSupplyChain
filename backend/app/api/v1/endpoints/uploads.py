"""
Production AI Agent — CSV Upload & Processing Endpoints
=========================================================
REST API endpoints for uploading and triggering CSV data ingestion.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, File, Query, Request, UploadFile, status

from app.api.deps import CurrentUser, get_data_processing_service, get_upload_service, require_roles
from app.models.domain import FileType, UploadStatus, UserRole
from app.schemas.schemas import UploadResponse, UploadStatusResponse
from app.services.data_processing_service import DataProcessingService
from app.services.upload_service import UploadService

router = APIRouter(prefix="/upload", tags=["CSV Uploads"])


@router.post(
    "/procurement",
    response_model=UploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER))],
    summary="Upload Procurement CSV file",
)
async def upload_procurement_csv(
    request: Request,
    file: UploadFile = File(..., description="Procurement CSV file"),
    current_user: CurrentUser = None,
    upload_service: UploadService = Depends(get_upload_service),
    data_processing_service: DataProcessingService = Depends(get_data_processing_service),
):
    client_ip = request.client.host if request.client else ""
    upload_res = await upload_service.process_file_upload(
        file=file,
        file_type=FileType.PROCUREMENT,
        user_id=str(current_user.id),
        user_email=current_user.email,
        ip_address=client_ip,
    )
    # Auto-trigger data ingestion & cleaning pipeline
    await data_processing_service.process_upload(upload_res.id)
    return upload_res


@router.post(
    "/inventory",
    response_model=UploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER))],
    summary="Upload Inventory CSV file",
)
async def upload_inventory_csv(
    request: Request,
    file: UploadFile = File(..., description="Inventory CSV file"),
    current_user: CurrentUser = None,
    upload_service: UploadService = Depends(get_upload_service),
    data_processing_service: DataProcessingService = Depends(get_data_processing_service),
):
    client_ip = request.client.host if request.client else ""
    upload_res = await upload_service.process_file_upload(
        file=file,
        file_type=FileType.INVENTORY,
        user_id=str(current_user.id),
        user_email=current_user.email,
        ip_address=client_ip,
    )
    # Auto-trigger data ingestion & cleaning pipeline
    await data_processing_service.process_upload(upload_res.id)
    return upload_res


@router.post(
    "/production-orders",
    response_model=UploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER))],
    summary="Upload Production Orders CSV file",
)
async def upload_production_csv(
    request: Request,
    file: UploadFile = File(..., description="Production Orders CSV file"),
    current_user: CurrentUser = None,
    upload_service: UploadService = Depends(get_upload_service),
    data_processing_service: DataProcessingService = Depends(get_data_processing_service),
):
    client_ip = request.client.host if request.client else ""
    upload_res = await upload_service.process_file_upload(
        file=file,
        file_type=FileType.PRODUCTION_ORDERS,
        user_id=str(current_user.id),
        user_email=current_user.email,
        ip_address=client_ip,
    )
    # Auto-trigger data ingestion & cleaning pipeline
    await data_processing_service.process_upload(upload_res.id)
    return upload_res


@router.post(
    "/{upload_id}/process",
    summary="Re-trigger CSV data processing pipeline",
)
async def reprocess_upload(
    upload_id: str,
    current_user: CurrentUser = None,
    data_processing_service: DataProcessingService = Depends(get_data_processing_service),
):
    success = await data_processing_service.process_upload(upload_id)
    return {"upload_id": upload_id, "success": success}


@router.get(
    "/history",
    response_model=List[UploadStatusResponse],
    summary="Get user upload history",
)
async def get_upload_history(
    file_type: Optional[FileType] = Query(None),
    status: Optional[UploadStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: CurrentUser = None,
    upload_service: UploadService = Depends(get_upload_service),
):
    skip = (page - 1) * page_size
    return await upload_service.get_user_uploads(
        user_id=str(current_user.id),
        file_type=file_type,
        status=status,
        skip=skip,
        limit=page_size,
    )


@router.get(
    "/{upload_id}",
    response_model=UploadStatusResponse,
    summary="Get detailed upload status by ID",
)
async def get_upload_by_id(
    upload_id: str,
    current_user: CurrentUser = None,
    upload_service: UploadService = Depends(get_upload_service),
):
    return await upload_service.get_upload_status(
        upload_id=upload_id,
        user_id=str(current_user.id),
    )
