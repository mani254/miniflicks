import type { Request, Response } from 'express';
import mongoose, { type Types } from 'mongoose';
import { Screen } from './screen.schema';
import { Location } from '../locations/location.schema';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { getRelativeFilePath } from '../../shared/utils/upload';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/AppError';

/** Helper: extract single id from req.params */
function extractId(req: Request): string | null {
  const raw = req.params['id'];
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
}

/** Helper: parse JSON or return fallback */
function parseJsonField<T>(val: unknown, fallback: T): T {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  if (val !== undefined && val !== null) {
    return val as T;
  }
  return fallback;
}

/**
 * GET /api/screens
 * - Unauthenticated: active screens only (status: true), filter by location if given
 * - SuperAdmin: all screens, or filter by ?location=...
 * - Location Admin: ONLY screens for their own location
 */
export const getScreens = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const locationParam = (req.query['location'] || req.query['locationId']) as string | undefined;
  const isPublicRoute = req.path.includes('getUserScreens') || req.query['activeOnly'] === 'true';

  let query: Record<string, unknown> = {};

  if (isPublicRoute || !req.user) {
    // Public visitor or user-facing booking screens
    query['status'] = true;
    if (locationParam) query['location'] = locationParam;
  } else if (req.user.superAdmin) {
    // SuperAdmin
    if (locationParam) query['location'] = locationParam;
  } else {
    // Location admin — restricted to own location
    if (!req.user.locationId) {
      res.status(200).json({
        success: true,
        screens: [],
        data: [],
        totalDocuments: 0,
      });
      return;
    }
    query['location'] = req.user.locationId;
  }

  const screens = await Screen.find(query)
    .populate('location', 'name _id')
    .populate('packages.addons')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    screens,
    data: screens,
    totalDocuments: screens.length,
  });
});

/**
 * GET /api/screens/:id
 */
export const getScreen = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid screen ID');

  const screen = await Screen.findById(id)
    .populate('location', 'name _id')
    .populate('packages.addons');

  if (!screen) throw new NotFoundError('Screen not found');

  // If location admin, ensure ownership
  if (req.user && !req.user.superAdmin) {
    const loc = screen.location as any;
    const screenLocationId = loc?._id ? loc._id.toString() : loc?.toString();

    if (screenLocationId !== req.user.locationId?.toString()) {
      throw new AuthorizationError('You are not authorized to view this screen');
    }
  }

  res.status(200).json({
    success: true,
    screen,
    data: screen,
  });
});

/**
 * POST /api/screens
 * SuperAdmin OR Location Owner
 */
export const addScreen = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Record<string, any>;

  let targetLocationId = body.location;
  if (!req.user?.superAdmin) {
    // Location admin must create for their own location
    targetLocationId = req.user?.locationId?.toString();
  }

  if (!targetLocationId || !mongoose.Types.ObjectId.isValid(targetLocationId)) {
    throw new ValidationError('A valid location ID is required');
  }

  if (!body.name || !body.capacity || !body.minPeople) {
    throw new ValidationError('name, capacity, and minPeople are required');
  }

  // Handle uploaded files
  const imagePaths: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      imagePaths.push(getRelativeFilePath('screens', file.filename));
    }
  }

  // Handle any existing/string image paths passed
  if (body.images) {
    const rawImages = Array.isArray(body.images) ? body.images : [body.images];
    for (const img of rawImages) {
      if (typeof img === 'string' && img.trim() && !img.startsWith('blob:')) {
        imagePaths.push(img.trim());
      }
    }
  }

  const specifications = parseJsonField<string[]>(body.specifications, []);
  const slots = parseJsonField<any[]>(body.slots, []);
  const packages = parseJsonField<any[]>(body.packages, []);

  const screen = new Screen({
    name: body.name,
    capacity: Number(body.capacity),
    minPeople: Number(body.minPeople),
    extraPersonPrice: Number(body.extraPersonPrice) || 0,
    description: body.description || '',
    status: body.status === 'true' || body.status === true,
    location: targetLocationId,
    images: imagePaths,
    specifications,
    slots,
    packages,
  });

  const savedScreen = await screen.save();

  // Add screen to Location's screens array
  await Location.findByIdAndUpdate(targetLocationId, {
    $addToSet: { screens: savedScreen._id },
  });

  const populated = await Screen.findById(savedScreen._id).populate('location', 'name _id');

  res.status(201).json({
    success: true,
    message: 'Screen added successfully',
    screen: populated,
    data: populated,
  });
});

/**
 * PUT /api/screens/:id
 * SuperAdmin OR Location Owner
 */
export const updateScreen = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid screen ID');

  const existingScreen = await Screen.findById(id);
  if (!existingScreen) throw new NotFoundError('Screen not found');

  // Ownership check
  if (!req.user?.superAdmin) {
    if (existingScreen.location.toString() !== req.user?.locationId?.toString()) {
      throw new AuthorizationError('You are not authorized to update this screen');
    }
  }

  const body = req.body as Record<string, any>;

  // Handle images: preserve existing and add newly uploaded
  const updatedImages: string[] = [];

  // If new files were uploaded
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files) {
      updatedImages.push(getRelativeFilePath('screens', file.filename));
    }
  }

  // If existing image paths were retained in body.images
  if (body.images) {
    const rawImages = Array.isArray(body.images) ? body.images : [body.images];
    for (const img of rawImages) {
      if (typeof img === 'string' && img.trim() && !img.startsWith('blob:')) {
        updatedImages.push(img.trim());
      }
    }
  }

  // If no new images and no body images provided, keep current images
  if (updatedImages.length > 0) {
    existingScreen.images = updatedImages;
  }

  if (body.name) existingScreen.name = body.name;
  if (typeof body.capacity !== 'undefined') existingScreen.capacity = Number(body.capacity);
  if (typeof body.minPeople !== 'undefined') existingScreen.minPeople = Number(body.minPeople);
  if (typeof body.extraPersonPrice !== 'undefined') existingScreen.extraPersonPrice = Number(body.extraPersonPrice);
  if (typeof body.description !== 'undefined') existingScreen.description = body.description;
  if (typeof body.status !== 'undefined') existingScreen.status = body.status === 'true' || body.status === true;

  if (body.specifications) {
    existingScreen.specifications = parseJsonField<string[]>(body.specifications, existingScreen.specifications);
  }
  if (body.slots) {
    existingScreen.slots = parseJsonField<any[]>(body.slots, existingScreen.slots);
  }
  if (body.packages) {
    existingScreen.packages = parseJsonField<any[]>(body.packages, existingScreen.packages);
  }

  // Location relocation — SuperAdmin only
  if (req.user?.superAdmin && body.location && body.location !== existingScreen.location.toString()) {
    const oldLocId = existingScreen.location;
    const newLocId = body.location;
    await Location.findByIdAndUpdate(oldLocId, { $pull: { screens: existingScreen._id } });
    await Location.findByIdAndUpdate(newLocId, { $addToSet: { screens: existingScreen._id } });
    existingScreen.location = newLocId;
  }

  const updated = await existingScreen.save();
  const populated = await Screen.findById(updated._id).populate('location', 'name _id');

  res.status(200).json({
    success: true,
    message: 'Screen updated successfully',
    screen: populated,
    data: populated,
  });
});

/**
 * PUT /api/screens/status/:id
 * SuperAdmin OR Location Owner
 */
export const changeScreenStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid screen ID');

  const existingScreen = await Screen.findById(id);
  if (!existingScreen) throw new NotFoundError('Screen not found');

  if (!req.user?.superAdmin) {
    if (existingScreen.location.toString() !== req.user?.locationId?.toString()) {
      throw new AuthorizationError('You are not authorized to update this screen');
    }
  }

  const { status } = req.body as { status?: unknown };
  if (typeof status === 'undefined') {
    throw new ValidationError('Status field is required');
  }

  existingScreen.status = status === true || status === 'true';
  const updated = await existingScreen.save();

  const populated = await Screen.findById(updated._id).populate('location', 'name _id');

  res.status(200).json({
    success: true,
    message: 'Screen status updated successfully',
    screen: populated,
    data: populated,
  });
});

/**
 * DELETE /api/screens/:id
 * SuperAdmin OR Location Owner
 */
export const deleteScreen = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid screen ID');

  const existingScreen = await Screen.findById(id);
  if (!existingScreen) throw new NotFoundError('Screen not found');

  if (!req.user?.superAdmin) {
    if (existingScreen.location.toString() !== req.user?.locationId?.toString()) {
      throw new AuthorizationError('You are not authorized to delete this screen');
    }
  }

  // Remove from location
  await Location.findByIdAndUpdate(existingScreen.location, {
    $pull: { screens: existingScreen._id },
  });

  await Screen.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Screen deleted successfully',
    data: { message: 'Screen deleted successfully' },
  });
});
