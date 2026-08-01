"""
Production AI Agent — User Repository
======================================
Data access layer for the 'users' collection.
All MongoDB operations for users are encapsulated here.

Repository Pattern:
  - Services call repositories (never raw DB queries)
  - Repositories are the only layer that knows about MongoDB
  - Each method is a single, well-named data operation
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.domain import UserModel, UserRole

logger = logging.getLogger(__name__)

COLLECTION = "users"


class UserRepository:
    """
    Handles all CRUD operations on the 'users' MongoDB collection.
    Injected as a dependency into services that need user data access.
    """

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._collection = db[COLLECTION]

    # ---------------------------------------------------------------------------
    # Create
    # ---------------------------------------------------------------------------

    async def create(self, user: UserModel) -> UserModel:
        """
        Insert a new user document.

        Args:
            user: UserModel instance (without _id; will be assigned by MongoDB)

        Returns:
            UserModel with id populated from inserted document

        Raises:
            DuplicateKeyError: If email already exists (handled upstream)
        """
        document = user.to_dict()
        result = await self._collection.insert_one(document)
        user.id = str(result.inserted_id)
        logger.info("User created", extra={"user_id": user.id, "email": user.email})
        return user

    # ---------------------------------------------------------------------------
    # Read
    # ---------------------------------------------------------------------------

    async def find_by_id(self, user_id: str) -> Optional[UserModel]:
        """Find a single user by their ObjectId string."""
        if not ObjectId.is_valid(user_id):
            return None
        doc = await self._collection.find_one({"_id": ObjectId(user_id)})
        return self._map(doc)

    async def find_by_email(self, email: str) -> Optional[UserModel]:
        """Find a single user by email (case-insensitive)."""
        doc = await self._collection.find_one(
            {"email": {"$regex": f"^{email}$", "$options": "i"}}
        )
        return self._map(doc)

    async def find_all(
        self,
        role: Optional[UserRole] = None,
        is_active: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[UserModel]:
        """
        Retrieve a paginated list of users with optional filters.

        Args:
            role:      Filter by role (admin | manager | viewer)
            is_active: Filter by active status
            skip:      Pagination offset
            limit:     Page size (max 100)

        Returns:
            List of UserModel instances
        """
        query: dict = {}
        if role is not None:
            query["role"] = role.value
        if is_active is not None:
            query["is_active"] = is_active

        cursor = self._collection.find(query).skip(skip).limit(min(limit, 100))
        docs = await cursor.to_list(length=min(limit, 100))
        return [self._map(doc) for doc in docs if doc]

    async def count(
        self,
        role: Optional[UserRole] = None,
        is_active: Optional[bool] = None,
    ) -> int:
        """Count users matching optional filters."""
        query: dict = {}
        if role is not None:
            query["role"] = role.value
        if is_active is not None:
            query["is_active"] = is_active
        return await self._collection.count_documents(query)

    async def email_exists(self, email: str) -> bool:
        """Return True if any user with this email exists."""
        count = await self._collection.count_documents(
            {"email": {"$regex": f"^{email}$", "$options": "i"}}
        )
        return count > 0

    # ---------------------------------------------------------------------------
    # Update
    # ---------------------------------------------------------------------------

    async def update(self, user_id: str, updates: dict) -> Optional[UserModel]:
        """
        Apply a partial update to a user document.

        Args:
            user_id: Target user's ObjectId string
            updates: Dict of fields to update (key: new value)

        Returns:
            Updated UserModel, or None if not found
        """
        if not ObjectId.is_valid(user_id):
            return None

        result = await self._collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": updates},
            return_document=True,  # Return the updated document
        )
        if result:
            logger.info("User updated", extra={"user_id": user_id, "fields": list(updates.keys())})
        return self._map(result)

    async def record_login(self, user_id: str) -> None:
        """Update the last_login timestamp for a user after successful auth."""
        await self._collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"last_login": datetime.now(timezone.utc)}},
        )

    # ---------------------------------------------------------------------------
    # Delete (soft delete via is_active flag)
    # ---------------------------------------------------------------------------

    async def deactivate(self, user_id: str) -> bool:
        """
        Soft-delete a user by setting is_active=False.
        Hard deletes are never performed to preserve audit trail.

        Returns:
            True if the user was found and deactivated, False otherwise
        """
        result = await self._collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": False}},
        )
        deactivated = result.modified_count > 0
        if deactivated:
            logger.info("User deactivated", extra={"user_id": user_id})
        return deactivated

    # ---------------------------------------------------------------------------
    # Private helpers
    # ---------------------------------------------------------------------------

    @staticmethod
    def _map(doc: Optional[dict]) -> Optional[UserModel]:
        """Convert a raw MongoDB document to a UserModel instance."""
        if doc is None:
            return None
        doc["_id"] = str(doc["_id"])
        return UserModel.model_validate(doc)
