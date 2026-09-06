import { Router } from 'express';
import {
  getScreens,
  getScreen,
  addScreen,
  updateScreen,
  changeScreenStatus,
  deleteScreen,
} from './screen.controller';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware';
import { createUploader } from '../../shared/utils/upload';

const screenRouter = Router();
const upload = createUploader('screens');

// ─── Public / Optional Auth (Website + Dashboard) ────────────────────────────
screenRouter.get('/getUserScreens', optionalAuth, getScreens);
screenRouter.get('/getAllScreens', optionalAuth, getScreens);
screenRouter.get('/', optionalAuth, getScreens);
screenRouter.get('/:id', optionalAuth, getScreen);

// ─── Admin Routes (SuperAdmin or Location Owner) ─────────────────────────────
screenRouter.post('/', requireAuth, upload.array('images', 10), addScreen);
screenRouter.put('/:id', requireAuth, upload.array('images', 10), updateScreen);
screenRouter.put('/status/:id', requireAuth, changeScreenStatus);
screenRouter.delete('/:id', requireAuth, deleteScreen);

export default screenRouter;
