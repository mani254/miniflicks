import type { Types } from 'mongoose';

/**
 * Express Request augmentation.
 * Adds typed `user` property populated by auth middleware.
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by `requireAuth` / `requireAnyAdmin` middleware.
       * Undefined on unauthenticated routes.
       */
      user?: AuthenticatedUser;
    }
  }
}

export interface AuthenticatedUser {
  /** The admin's primary key (from Admin collection or the Location's admin record) */
  id: string;
  name: string;
  email: string;
  /** true = super admin (global access), false = location admin */
  superAdmin: boolean;
  /** Location ObjectId — only set when superAdmin = false */
  locationId: Types.ObjectId | null;
}

export {};
