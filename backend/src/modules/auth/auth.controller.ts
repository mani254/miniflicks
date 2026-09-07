import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { ConflictError, ValidationError } from '../../shared/errors/AppError';
import { config } from '../../config/env';
import {
  loginService,
  verifyToken,
  registerSuperAdminService,
  createLocationAdminService,
} from './auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
} as const;

/** POST /api/auth/login */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const result = await loginService(email, password);

  res
    .status(200)
    .cookie(config.auth.cookieName, result.token, COOKIE_OPTIONS)
    .json({ success: true, data: { admin: result.admin, token: result.token } });
});

/** POST /api/auth/initialLogin — validates token already stored client-side */
export const initialLogin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token?: string };

  if (!token) {
    throw new ValidationError('Token is required');
  }

  const decoded = verifyToken(token); // throws AuthenticationError if invalid/expired

  const adminInfo = {
    id: decoded.id,
    name: decoded.name,
    email: decoded.email,
    superAdmin: decoded.superAdmin,
    locationId: decoded.locationId,
  };

  res
    .status(200)
    .cookie(config.auth.cookieName, token, COOKIE_OPTIONS)
    .json({ success: true, data: { admin: adminInfo, token } });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  res
    .status(200)
    .cookie(config.auth.cookieName, '', {
      ...COOKIE_OPTIONS,
      maxAge: 0,
    })
    .json({ success: true, data: { message: 'Logged out successfully' } });
});

/** POST /api/auth/register — create super admin (disabled after bootstrap) */
export const registerSuperAdmin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      throw new ValidationError('Name, email, and password are required');
    }

    try {
      const admin = await registerSuperAdminService(name, email, password);
      sendSuccess(res, { admin }, 201);
    } catch (err) {
      if (err instanceof Error && err.message === 'Email already exists') {
        throw new ConflictError('Email already exists');
      }
      throw err;
    }
  },
);

/**
 * POST /api/auth/create-location-admin
 * SuperAdmin only — creates an Admin (superAdmin=false) linked to a location.
 * Body: { name, email, password, locationId, phone? }
 */
export const createLocationAdmin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, locationId, phone } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      locationId?: string;
      phone?: string;
    };

    if (!name || !email || !password || !locationId) {
      throw new ValidationError('name, email, password and locationId are required');
    }

    const result = await createLocationAdminService(name, email, password, locationId, phone);
    sendSuccess(res, { admin: result }, 201);
  },
);
