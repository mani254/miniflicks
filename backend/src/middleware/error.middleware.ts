import type { Request, Response, NextFunction } from 'express';
import { isAppError } from '../shared/errors/AppError';
import { sendError } from '../shared/utils/response';

/**
 * Global Express error handler.
 * Must be registered LAST in app.ts after all routes.
 * Handles both operational (AppError) and programmer errors.
 */
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Log all errors (structured for production log aggregators)
  const logLevel = isAppError(err) && err.isOperational ? 'warn' : 'error';
  console[logLevel]({
    message: isAppError(err) ? err.message : String(err),
    code: isAppError(err) ? err.code : 'UNKNOWN',
    statusCode: isAppError(err) ? err.statusCode : 500,
    method: req.method,
    path: req.path,
    stack: err instanceof Error ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  sendError(res, err);
}

/**
 * 404 handler — must be registered after all routes but before errorMiddleware.
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
