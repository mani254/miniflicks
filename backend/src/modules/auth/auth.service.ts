import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { config } from '../../config/env';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/AppError';
import type { JwtPayload, LoginResponseData } from './auth.types';
import { Admin } from '../admin/admin.schema';

/* ─── JWT helpers ────────────────────────────────────────────────────────── */
function buildJwtPayload(
  id: string,
  name: string,
  email: string,
  superAdmin: boolean,
  locationId: Types.ObjectId | string | null,
): JwtPayload {
  return {
    id,
    name,
    email,
    superAdmin,
    locationId: locationId ? locationId.toString() : null,
  };
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  });
}

/* ─── Login ──────────────────────────────────────────────────────────────── */
export async function loginService(
  email: string,
  password: string,
): Promise<LoginResponseData> {
  // Single lookup — Admin collection covers both super-admins and location admins
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!admin) {
    throw new NotFoundError('Admin');
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) throw new AuthenticationError('Invalid email or password');

  const locationId = admin.superAdmin ? null : (admin.location ?? null);

  const payload = buildJwtPayload(
    admin._id.toString(),
    admin.name,
    admin.email,
    admin.superAdmin,
    locationId,
  );

  return {
    admin: {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      superAdmin: admin.superAdmin,
      locationId: admin.superAdmin ? null : (admin.location as Types.ObjectId | null) ?? null,
    },
    token: signToken(payload),
  };
}

/* ─── Token verification ─────────────────────────────────────────────────── */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token expired, please log in again');
    }
    throw new AuthenticationError('Invalid token');
  }
}

/* ─── Register super admin ───────────────────────────────────────────────── */
export async function registerSuperAdminService(
  name: string,
  email: string,
  password: string,
): Promise<{ id: string; name: string; email: string }> {
  const exists = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (exists) throw new ConflictError('Email already exists');

  const admin = new Admin({ name, email, password, superAdmin: true });
  await admin.save();

  return { id: admin._id.toString(), name: admin.name, email: admin.email };
}

/* ─── Create location admin (superAdmin only) ────────────────────────────── */
export async function createLocationAdminService(
  name: string,
  email: string,
  password: string,
  locationId: string,
  phone?: string,
): Promise<{ id: string; name: string; email: string; locationId: string }> {
  const exists = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (exists) throw new ConflictError('Email already in use');

  // Verify the location exists
  const Location = (await import('../locations/location.schema')).Location;
  const location = await Location.findById(locationId);
  if (!location) throw new NotFoundError('Location');

  // Check if the location already has an admin
  if (location.admin) {
    const existingAdmin = await Admin.findById(location.admin);
    if (existingAdmin) {
      throw new ValidationError('This location already has an admin assigned');
    }
  }

  const adminDoc = new Admin({
    name,
    email,
    password,
    phone,
    superAdmin: false,
    location: locationId,
  });
  await adminDoc.save();

  // Write the reference back into the location document
  location.admin = adminDoc._id;
  await location.save({ validateModifiedOnly: true });

  return {
    id: adminDoc._id.toString(),
    name: adminDoc.name,
    email: adminDoc.email,
    locationId,
  };
}
