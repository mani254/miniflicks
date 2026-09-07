import { Router, type Request, type Response, type NextFunction } from 'express';
import mongoose from 'mongoose';
import { Banner } from './banner.schema';
import { createUploader, getRelativeFilePath } from '../../shared/utils/upload';
import { requireAuth, requireSuperAdmin } from '../../middleware/auth.middleware';

const bannerRouter = Router();
const upload = createUploader('banners');

/** Helper: extract & validate an ObjectId from route params */
function extractId(req: Request): string | null {
  const raw = req.params['id'];
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
}

// ─── GET /getUserBanners (Public — website customer banners) ──────────────────
bannerRouter.get('/getUserBanners', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await Banner.find({ status: true }).sort({ position: 1 });
    res.status(200).json({ success: true, banners, totalDocuments: banners.length });
  } catch (err) {
    next(err);
  }
});

// ─── Admin routes (requireAuth + requireSuperAdmin) ───────────────────────────

// GET / — List all banners
bannerRouter.get('/', requireAuth, requireSuperAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await Banner.find().sort({ position: 1 });
    res.status(200).json({ success: true, banners, totalDocuments: banners.length });
  } catch (err) {
    next(err);
  }
});

// GET /:id — Single banner
bannerRouter.get('/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  const id = extractId(req);
  if (!id) { next(); return; }
  try {
    const banner = await Banner.findById(id);
    if (!banner) {
      res.status(404).json({ success: false, error: { message: 'Banner not found' } });
      return;
    }
    res.status(200).json({ success: true, banner });
  } catch (err) {
    next(err);
  }
});

// POST / — Create banner
bannerRouter.post('/', requireAuth, requireSuperAdmin, upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, link, position, status } = req.body as Record<string, string>;

    let imagePath: string | undefined;
    if (req.file) {
      imagePath = getRelativeFilePath('banners', req.file.filename);
    } else if (typeof req.body.image === 'string' && (req.body.image as string).startsWith('/uploads/')) {
      imagePath = req.body.image as string;
    }

    if (!imagePath) {
      res.status(400).json({ success: false, error: { message: 'Image is required' } });
      return;
    }

    const banner = await Banner.create({
      title,
      description,
      link,
      position: Number(position) || 0,
      status: status === 'true' || (status as unknown) === true,
      image: imagePath,
    });

    res.status(201).json({ success: true, banner });
  } catch (err) {
    next(err);
  }
});

// PUT /status/:id — Update status
bannerRouter.put('/status/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  const id = extractId(req);
  if (!id) { next(); return; }
  try {
    const { status } = req.body as { status: unknown };
    const banner = await Banner.findByIdAndUpdate(
      id,
      { status: status === true || status === 'true' },
      { new: true },
    );
    if (!banner) {
      res.status(404).json({ success: false, error: { message: 'Banner not found' } });
      return;
    }
    res.status(200).json({ success: true, banner });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Update banner
bannerRouter.put('/:id', requireAuth, requireSuperAdmin, upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  const id = extractId(req);
  if (!id) { next(); return; }
  try {
    const { title, description, link, position, status } = req.body as Record<string, string>;

    const updateData: Record<string, unknown> = {
      title,
      description,
      link,
      position: Number(position) || 0,
      status: status === 'true' || (status as unknown) === true,
    };

    if (req.file) {
      updateData['image'] = getRelativeFilePath('banners', req.file.filename);
    } else if (typeof req.body.image === 'string' && (req.body.image as string).startsWith('/uploads/')) {
      updateData['image'] = req.body.image as string;
    }

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!banner) {
      res.status(404).json({ success: false, error: { message: 'Banner not found' } });
      return;
    }
    res.status(200).json({ success: true, banner });
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — Delete banner
bannerRouter.delete('/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  const id = extractId(req);
  if (!id) { next(); return; }
  try {
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      res.status(404).json({ success: false, error: { message: 'Banner not found' } });
      return;
    }
    res.status(200).json({ success: true, data: { message: 'Banner deleted' } });
  } catch (err) {
    next(err);
  }
});

export default bannerRouter;
