import { Router } from 'express';
import {
  getLocations,
  getLocation,
  addLocation,
  updateLocation,
  changeLocationStatus,
  deleteLocation,
} from './location.controller';
import { requireAuth, requireSuperAdmin, optionalAuth } from '../../middleware/auth.middleware';
import { createUploader } from '../../shared/utils/upload';

const locationRouter = Router();
const upload = createUploader('locations');

// ─── Public / Optional Auth (Website + Dashboard) ────────────────────────────
locationRouter.get('/getUserLocations', optionalAuth, getLocations);
locationRouter.get('/getAllLocations', optionalAuth, getLocations);
locationRouter.get('/', optionalAuth, getLocations);
locationRouter.get('/:id', optionalAuth, getLocation);

// ─── Admin Routes ────────────────────────────────────────────────────────────

// Create Location — SuperAdmin only
locationRouter.post('/', requireAuth, requireSuperAdmin, upload.single('image'), addLocation);

// Update Location — SuperAdmin or Location Owner
locationRouter.put('/:id', requireAuth, upload.single('image'), updateLocation);

// Change Status — SuperAdmin or Location Owner
locationRouter.put('/status/:id', requireAuth, changeLocationStatus);

// Delete Location — SuperAdmin only
locationRouter.delete('/:id', requireAuth, requireSuperAdmin, deleteLocation);

export default locationRouter;
