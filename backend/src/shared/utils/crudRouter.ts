import { Router, type Request, type Response, type NextFunction, type RequestHandler } from 'express';
import mongoose, { type Model } from 'mongoose';
import { requireAuth, requireSuperAdmin } from '../../middleware/auth.middleware';
import { createUploader, getRelativeFilePath } from './upload';

export interface CrudRouterOptions {
  populateFields?: string[];
  uploadFolder?: string;
  readMiddlewares?: RequestHandler[];
  writeMiddlewares?: RequestHandler[];
}

export function createCrudRouter(
  model: Model<any>,
  resourceNameSingular: string,
  resourceNamePlural: string,
  populateOrOptions: string[] | CrudRouterOptions = [],
): Router {
  const router = Router();

  const options: CrudRouterOptions = Array.isArray(populateOrOptions)
    ? { populateFields: populateOrOptions }
    : populateOrOptions;

  const populateFields = options.populateFields || [];
  const upload = options.uploadFolder ? createUploader(options.uploadFolder) : null;
  const readMiddlewares = options.readMiddlewares || [];
  const writeMiddlewares = options.writeMiddlewares || [requireAuth, requireSuperAdmin];

  // Helper endpoints matching frontend catalog API legacy routes
  const handleGetActiveOrAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      let query = model.find({ status: { $ne: false } });
      if (populateFields.length > 0) {
        populateFields.forEach((field) => {
          query = query.populate(field) as any;
        });
      }
      const items = await query.exec();
      res.status(200).json({
        success: true,
        data: items,
        [resourceNamePlural]: items,
        totalDocuments: items.length,
      });
    } catch (err) {
      next(err);
    }
  };

  // Specific helper routes for legacy action paths
  router.get(
    `/getUser${resourceNamePlural.charAt(0).toUpperCase() + resourceNamePlural.slice(1)}`,
    ...readMiddlewares,
    handleGetActiveOrAll,
  );
  router.get(
    `/getAll${resourceNamePlural.charAt(0).toUpperCase() + resourceNamePlural.slice(1)}`,
    ...readMiddlewares,
    handleGetActiveOrAll,
  );

  // GET / — List all items
  router.get('/', ...readMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    try {
      let query = model.find();
      if (populateFields.length > 0) {
        populateFields.forEach((field) => {
          query = query.populate(field) as any;
        });
      }
      const items = await query.exec();
      const totalDocuments = await model.countDocuments();
      res.status(200).json({
        success: true,
        data: items,
        [resourceNamePlural]: items,
        totalDocuments,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — Get single item (validates ObjectId)
  router.get('/:id', ...readMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    const idParam = req.params['id'];
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      next();
      return;
    }

    try {
      let query = model.findById(id);
      if (populateFields.length > 0) {
        populateFields.forEach((field) => {
          query = query.populate(field) as any;
        });
      }
      const item = await query.exec();
      if (!item) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
        return;
      }
      res.status(200).json({
        success: true,
        data: item,
        [resourceNameSingular]: item,
      });
    } catch (err) {
      next(err);
    }
  });

  // Helper to normalize body fields when receiving FormData
  const normalizeBody = (req: Request) => {
    const body = req.body || {};
    if (upload && req.file && options.uploadFolder) {
      body.image = getRelativeFilePath(options.uploadFolder, req.file.filename);
    }
    if (typeof body.status === 'string') {
      body.status = body.status === 'true';
    }
    if (typeof body.special === 'string') {
      body.special = body.special === 'true';
    }
    if (typeof body.price === 'string' && !isNaN(Number(body.price))) {
      body.price = Number(body.price);
    }
    if (typeof body.specialPrice === 'string' && !isNaN(Number(body.specialPrice))) {
      body.specialPrice = Number(body.specialPrice);
    }
    if (typeof body.position === 'string' && !isNaN(Number(body.position))) {
      body.position = Number(body.position);
    }
    if (typeof body.addons === 'string') {
      try { body.addons = JSON.parse(body.addons); } catch { /* ignore */ }
    }
    return body;
  };

  // POST / — Create item
  const postHandlers: RequestHandler[] = [...writeMiddlewares];
  if (upload) postHandlers.push(upload.single('image'));
  postHandlers.push(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = normalizeBody(req);
      const item = await model.create(data);
      res.status(201).json({
        success: true,
        data: item,
        [resourceNameSingular]: item,
      });
    } catch (err) {
      next(err);
    }
  });
  router.post('/', ...postHandlers);

  // PUT /:id — Update item
  const putHandlers: RequestHandler[] = [...writeMiddlewares];
  if (upload) putHandlers.push(upload.single('image'));
  putHandlers.push(async (req: Request, res: Response, next: NextFunction) => {
    const idParam = req.params['id'];
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      next();
      return;
    }

    try {
      const data = normalizeBody(req);
      const item = await model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!item) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
        return;
      }
      res.status(200).json({
        success: true,
        data: item,
        [resourceNameSingular]: item,
      });
    } catch (err) {
      next(err);
    }
  });
  router.put('/:id', ...putHandlers);

  // PUT /status/:id — Toggle status field
  router.put('/status/:id', ...writeMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    const idParam = req.params['id'];
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      next();
      return;
    }

    try {
      const { status } = req.body;
      if (typeof status === 'undefined') {
        res.status(400).json({ success: false, error: { message: '`status` field is required' } });
        return;
      }
      const item = await model.findByIdAndUpdate(
        id,
        { status: status === true || status === 'true' },
        { new: true, runValidators: false },
      );
      if (!item) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
        return;
      }
      res.status(200).json({
        success: true,
        data: item,
        [resourceNameSingular]: item,
      });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — Delete item
  router.delete('/:id', ...writeMiddlewares, async (req: Request, res: Response, next: NextFunction) => {
    const idParam = req.params['id'];
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      next();
      return;
    }

    try {
      const item = await model.findByIdAndDelete(id);
      if (!item) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } });
        return;
      }
      res.status(200).json({ success: true, data: { message: 'Deleted successfully' } });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
