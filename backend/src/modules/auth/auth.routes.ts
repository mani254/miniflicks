import { Router } from 'express';
import {
  login,
  logout,
  initialLogin,
  // registerSuperAdmin,
  createLocationAdmin,
} from './auth.controller';
import { requireAuth, requireSuperAdmin } from '../../middleware/auth.middleware';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/initialLogin', initialLogin);
authRouter.post('/logout', logout);

// SuperAdmin creation (commented out after initial setup as requested)
// authRouter.post('/register', registerSuperAdmin);

// Location Admin creation (SuperAdmin only)
authRouter.post('/create-location-admin', requireAuth, requireSuperAdmin, createLocationAdmin);

export default authRouter;
