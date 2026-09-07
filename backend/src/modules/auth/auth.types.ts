import type { Types } from 'mongoose';

/** JWT payload — NEVER include password hash */
export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  superAdmin: boolean;
  /** Location ObjectId string — present only for location admins */
  locationId: string | null;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegisterSuperAdminBody {
  name: string;
  email: string;
  password: string;
}

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  superAdmin: boolean;
  locationId: Types.ObjectId | null;
}

export interface LoginResponseData {
  admin: AdminInfo;
  token: string;
}
