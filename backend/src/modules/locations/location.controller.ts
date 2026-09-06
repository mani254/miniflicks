import type { Request, Response } from 'express';
import mongoose, { type Types } from 'mongoose';
import { Location } from './location.schema';
import { Admin } from '../admin/admin.schema';
import { City } from '../cities/city.schema';
import { Screen } from '../screens/screen.schema';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { getRelativeFilePath } from '../../shared/utils/upload';
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../../shared/errors/AppError';

/** Helper: extract single id from req.params */
function extractId(req: Request): string | null {
  const raw = req.params['id'];
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
  return id;
}

/** Helper: parse JSON safely or fallback to empty array */
function parseJsonArray(val: unknown): unknown[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Helper: extract nested admin fields from multipart/form-data or json */
function extractAdminData(body: Record<string, any>) {
  if (body.admin && typeof body.admin === 'object') {
    return {
      name: body.admin.name,
      email: body.admin.email,
      password: body.admin.password,
      number: body.admin.number || body.admin.phone,
    };
  }
  return {
    name: body['admin[name]'] || body['admin.name'],
    email: body['admin[email]'] || body['admin.email'],
    password: body['admin[password]'] || body['admin.password'],
    number: body['admin[number]'] || body['admin.number'] || body['admin[phone]'] || body['admin.phone'],
  };
}

/**
 * GET /api/locations
 * - Unauthenticated: active locations only (status: true)
 * - SuperAdmin: all locations
 * - Location Admin: only their own location
 */
export const getLocations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const cityQuery = req.query['city'] as string | undefined;

  let query: Record<string, unknown> = {};

  if (cityQuery) {
    query['city'] = cityQuery;
  }

  if (!req.user) {
    // Public visitor
    query['status'] = true;
    const locations = await Location.find(query)
      .populate('city')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      locations,
      data: locations,
      totalDocuments: locations.length,
    });
    return;
  }

  if (req.user.superAdmin) {
    // SuperAdmin sees all
    const locations = await Location.find(query)
      .populate('city')
      .populate('admin', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      locations,
      data: locations,
      totalDocuments: locations.length,
    });
    return;
  }

  // Location admin sees only their own location
  if (!req.user.locationId) {
    res.status(200).json({
      success: true,
      locations: [],
      data: [],
      totalDocuments: 0,
    });
    return;
  }

  const locations = await Location.find({ _id: req.user.locationId })
    .populate('city')
    .populate('admin', 'name email phone');

  res.status(200).json({
    success: true,
    locations,
    data: locations,
    totalDocuments: locations.length,
  });
});

/**
 * GET /api/locations/:id
 */
export const getLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid location ID');

  // If authenticated as location admin, enforce ownership check
  if (req.user && !req.user.superAdmin) {
    if (req.user.locationId?.toString() !== id) {
      throw new AuthorizationError('You are not authorized to view this location');
    }
  }

  const location = await Location.findById(id)
    .populate('city')
    .populate('admin', 'name email phone')
    .populate('addons')
    .populate('gifts')
    .populate('occasions')
    .populate('cakes')
    .populate('screens');

  if (!location) {
    throw new NotFoundError('Location not found');
  }

  res.status(200).json({
    success: true,
    location,
    data: location,
  });
});

/**
 * POST /api/locations
 * SuperAdmin only.
 * Creates an Admin document for the location admin, then creates the Location document.
 */
export const addLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = req.body as Record<string, any>;
  const adminData = extractAdminData(body);

  if (!adminData.name || !adminData.email || !adminData.password) {
    throw new ValidationError('Admin name, email, and password are required');
  }

  const cityId = body.cityId || body.city;
  if (!cityId || !mongoose.Types.ObjectId.isValid(cityId)) {
    throw new ValidationError('A valid city ID is required');
  }

  const isUnique = await Location.isNameUniqueInCity(body.name, cityId);
  if (!isUnique) {
    throw new ConflictError('Location name already exists in this city');
  }

  // Check if admin email is already used
  const existingAdmin = await Admin.findOne({ email: adminData.email.toLowerCase().trim() });
  if (existingAdmin) {
    throw new ConflictError('Admin with this email already exists');
  }

  // Handle uploaded image
  let imagePath: string | undefined;
  if (req.file) {
    imagePath = getRelativeFilePath('locations', req.file.filename);
  } else if (typeof body.image === 'string' && body.image.trim()) {
    imagePath = body.image.trim();
  }

  // 1. Create location admin account
  const adminDoc = new Admin({
    name: adminData.name.trim(),
    email: adminData.email.toLowerCase().trim(),
    password: adminData.password,
    phone: adminData.number ? String(adminData.number).trim() : undefined,
    superAdmin: false,
  });
  await adminDoc.save();

  // 2. Create location
  const location = new Location({
    name: body.name,
    address: body.address,
    addressLink: body.addressLink || '',
    status: body.status === 'true' || body.status === true,
    city: cityId,
    admin: adminDoc._id,
    image: imagePath,
    addons: parseJsonArray(body.addons),
    gifts: parseJsonArray(body.gifts),
  });

  const savedLocation = await location.save();

  // 3. Link location back to admin
  adminDoc.location = savedLocation._id;
  await adminDoc.save();

  // 4. Add location to City
  await City.findByIdAndUpdate(cityId, { $addToSet: { locations: savedLocation._id } });

  const populated = await Location.findById(savedLocation._id)
    .populate('city')
    .populate('admin', 'name email phone');

  res.status(201).json({
    success: true,
    message: 'Location saved successfully',
    location: populated,
    data: populated,
  });
});

/**
 * PUT /api/locations/:id
 * SuperAdmin OR Location Owner
 */
export const updateLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid location ID');

  // Ownership check
  if (!req.user?.superAdmin && req.user?.locationId?.toString() !== id) {
    throw new AuthorizationError('You are not authorized to update this location');
  }

  const existingLocation = await Location.findById(id);
  if (!existingLocation) {
    throw new NotFoundError('Location not found');
  }

  const body = req.body as Record<string, any>;
  const cityId = body.cityId || body.city || existingLocation.city;

  if (body.name && cityId) {
    const isUnique = await Location.isNameUniqueInCity(body.name, cityId, id);
    if (!isUnique) {
      throw new ConflictError('Location name already exists in this city');
    }
  }

  // Handle image upload
  if (req.file) {
    existingLocation.image = getRelativeFilePath('locations', req.file.filename);
  } else if (typeof body.image === 'string' && body.image.trim()) {
    existingLocation.image = body.image.trim();
  }

  // Handle admin updates
  const adminData = extractAdminData(body);
  if (adminData.name || adminData.email || adminData.password || adminData.number) {
    let adminDoc = await Admin.findById(existingLocation.admin);
    if (!adminDoc && adminData.email && adminData.name) {
      // Create admin if missing
      adminDoc = new Admin({
        name: adminData.name,
        email: adminData.email.toLowerCase().trim(),
        password: adminData.password || 'Temporary@123',
        phone: adminData.number,
        superAdmin: false,
        location: existingLocation._id,
      });
      await adminDoc.save();
      existingLocation.admin = adminDoc._id;
    } else if (adminDoc) {
      if (adminData.name) adminDoc.name = adminData.name;
      if (adminData.email) adminDoc.email = adminData.email.toLowerCase().trim();
      if (adminData.number) adminDoc.phone = String(adminData.number).trim();
      if (adminData.password) adminDoc.password = adminData.password; // pre-save will hash
      await adminDoc.save();
    }
  }

  // Handle city change if superAdmin
  if (req.user?.superAdmin && cityId && existingLocation.city.toString() !== cityId.toString()) {
    await City.findByIdAndUpdate(existingLocation.city, { $pull: { locations: existingLocation._id } });
    await City.findByIdAndUpdate(cityId, { $addToSet: { locations: existingLocation._id } });
    existingLocation.city = cityId as unknown as Types.ObjectId;
  }

  if (body.name) existingLocation.name = body.name;
  if (body.address) existingLocation.address = body.address;
  if (typeof body.addressLink !== 'undefined') existingLocation.addressLink = body.addressLink;
  if (typeof body.status !== 'undefined') existingLocation.status = body.status === 'true' || body.status === true;
  if (typeof body.addons !== 'undefined') existingLocation.addons = parseJsonArray(body.addons) as Types.ObjectId[];
  if (typeof body.gifts !== 'undefined') existingLocation.gifts = parseJsonArray(body.gifts) as Types.ObjectId[];

  const updated = await existingLocation.save();

  const populated = await Location.findById(updated._id)
    .populate('city')
    .populate('admin', 'name email phone');

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    location: populated,
    data: populated,
  });
});

/**
 * PUT /api/locations/status/:id
 * SuperAdmin OR Location Owner
 */
export const changeLocationStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid location ID');

  if (!req.user?.superAdmin && req.user?.locationId?.toString() !== id) {
    throw new AuthorizationError('You are not authorized to update this location status');
  }

  const { status } = req.body as { status?: unknown };
  if (typeof status === 'undefined') {
    throw new ValidationError('Status field is required');
  }

  const updated = await Location.findByIdAndUpdate(
    id,
    { status: status === true || status === 'true' },
    { new: true },
  )
    .populate('city')
    .populate('admin', 'name email phone');

  if (!updated) throw new NotFoundError('Location not found');

  res.status(200).json({
    success: true,
    message: 'Location status updated successfully',
    location: updated,
    data: updated,
  });
});

/**
 * DELETE /api/locations/:id
 * SuperAdmin only
 */
export const deleteLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = extractId(req);
  if (!id) throw new NotFoundError('Invalid location ID');

  const location = await Location.findById(id);
  if (!location) throw new NotFoundError('Location not found');

  // 1. Remove from City
  await City.findByIdAndUpdate(location.city, { $pull: { locations: location._id } });

  // 2. Delete associated screens
  await Screen.deleteMany({ location: location._id });

  // 3. Delete associated admin account if location admin
  if (location.admin) {
    await Admin.findByIdAndDelete(location.admin);
  }

  // 4. Delete location
  await Location.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Location deleted successfully',
    data: { message: 'Location deleted successfully' },
  });
});
