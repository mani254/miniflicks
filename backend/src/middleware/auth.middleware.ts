import type { Request, Response, NextFunction } from 'express';
import type { Types } from 'mongoose';
import { config } from '../config/env';
import { AuthenticationError, AuthorizationError } from '../shared/errors/AppError';
import { verifyToken } from '../modules/auth/auth.service';
import type { AuthenticatedUser } from '../shared/types/express';

/**
 * Extracts auth token from either cookies or Authorization: Bearer <token> header.
 */
export function extractToken(req: Request): string | undefined {
  const cookieToken = req.cookies?.[config.auth.cookieName] as string | undefined;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return undefined;
}

/**
 * Requires any authenticated admin (super-admin or location admin).
 * Populates `req.user` from the JWT payload.
 * Does NOT hit the database — trusts the signed JWT claims.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    return next(new AuthenticationError('No authentication token provided'));
  }

  try {
    const decoded = verifyToken(token); // throws AuthenticationError if invalid/expired

    const user: AuthenticatedUser = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      superAdmin: decoded.superAdmin,
      locationId: decoded.locationId
        ? (decoded.locationId as unknown as Types.ObjectId)
        : null,
    };

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Requires super-admin role.
 * Must be chained after requireAuth.
 */
export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AuthenticationError());
  }
  if (!req.user.superAdmin) {
    return next(new AuthorizationError('Super-admin access required'));
  }
  next();
}

/**
 * Requires that the authenticated user is either:
 * - a super admin, OR
 * - a location admin whose locationId matches the resource's location
 */
export function requireLocationAccess(resourceLocationId: string | Types.ObjectId | null | undefined) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError());
    }

    if (req.user.superAdmin) {
      return next(); // super admin has unrestricted access
    }

    if (!resourceLocationId || !req.user.locationId) {
      return next(new AuthorizationError('Access denied to this resource'));
    }

    const ownedLocation = req.user.locationId.toString();
    const resourceLocation = resourceLocationId.toString();

    if (ownedLocation !== resourceLocation) {
      return next(new AuthorizationError('Access denied to this resource'));
    }

    next();
  };
}

/**
 * Optional auth middleware — populates req.user if token is present,
 * but does NOT block unauthenticated requests.
 * Use for routes that have different behavior for admins vs. public users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      superAdmin: decoded.superAdmin,
      locationId: decoded.locationId
        ? (decoded.locationId as unknown as Types.ObjectId)
        : null,
    };
  } catch {
    // Silently ignore invalid tokens on optional auth routes
  }

  next();
}
