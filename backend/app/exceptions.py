from __future__ import annotations

from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base exception for application-specific errors."""

    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "An unexpected error occurred.",
    ) -> None:
        super().__init__(status_code=status_code, detail=detail)


class BadRequestException(AppException):
    def __init__(self, detail: str = "Bad request.") -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedException(AppException):
    def __init__(self, detail: str = "Invalid credentials.") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
        )


class ForbiddenException(AppException):
    def __init__(self, detail: str = "Access denied.") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class NotFoundException(AppException):
    def __init__(self, detail: str = "Resource not found.") -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class ConflictException(AppException):
    def __init__(self, detail: str = "Resource already exists.") -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
