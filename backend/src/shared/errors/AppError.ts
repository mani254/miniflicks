/**
 * Base application error class.
 * All domain errors should extend this class.
 * `isOperational = true` means it is a handled, expected error that should
 * produce a clean error response. `false` means it is a programmer error
 * that should cause the process to exit (or be restarted by PM2).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — request body / query / params failed validation */
export class ValidationError extends AppError {
  public readonly details: unknown[];

  constructor(message: string, details: unknown[] = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

/** 401 — missing or invalid credentials */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/** 403 — valid credentials but insufficient permissions */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/** 404 — resource does not exist */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/** 409 — conflict (duplicate, already exists, etc.) */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/** 402 / 422 — payment-specific errors */
export class PaymentError extends AppError {
  constructor(message: string, code = 'PAYMENT_ERROR') {
    super(message, 402, code);
  }
}

/** 422 — business rule violation (slot already booked, coupon expired, etc.) */
export class BusinessRuleError extends AppError {
  constructor(message: string, code = 'BUSINESS_RULE_ERROR') {
    super(message, 422, code);
  }
}

/** 503 — external service failure */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(message ?? `External service failure: ${service}`, 503, 'EXTERNAL_SERVICE_ERROR', false);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
