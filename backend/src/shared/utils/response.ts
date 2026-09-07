import type { Response } from 'express';
import { AppError, isAppError } from '../errors/AppError';

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

/**
 * Send a consistent success response.
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const body: SuccessResponse<T> = { success: true, data };
  res.status(statusCode).json(body);
}

/**
 * Send a consistent error response.
 * Never exposes stack traces or internal details in production.
 */
export function sendError(res: Response, err: unknown): void {
  if (isAppError(err)) {
    const body: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Attach validation details if present
    if ('details' in err && Array.isArray((err as { details: unknown[] }).details)) {
      body.error.details = (err as { details: unknown[] }).details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown / programmer error — do not expose internals
  const isProd = process.env['NODE_ENV'] === 'production';
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'An unexpected error occurred' : String(err),
    },
  } satisfies ErrorResponse);
}

/**
 * Build a typed AppError from a Mongoose duplicate-key error (code 11000).
 */
export function isDuplicateKeyError(err: unknown): err is { code: number; keyValue: Record<string, unknown> } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  );
}
