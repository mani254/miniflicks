import type { Request, Response } from 'express';
import { Customer } from './customer.schema';
import { Booking } from '../bookings/booking.schema';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import mongoose from 'mongoose';

/**
 * GET /api/customers — list customers with search, pagination (default 50), and role-based location scoping
 */
export const getCustomers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const isSuperAdmin = Boolean(req.user?.superAdmin);
  const locationParam = (req.query['location'] || req.query['locationId']) as string | undefined;
  const search = typeof req.query['search'] === 'string' ? req.query['search'].trim() : '';

  const page = Math.max(1, Number(req.query['page']) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 50));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};

  // Location scoping:
  // - If SuperAdmin and location param provided -> customers who booked at that location
  // - If Location Admin -> strictly customers who booked at their assigned location
  let targetLocationId: string | null = null;
  if (!isSuperAdmin) {
    targetLocationId = req.user?.locationId ? req.user.locationId.toString() : null;
  } else if (locationParam && mongoose.Types.ObjectId.isValid(locationParam)) {
    targetLocationId = locationParam;
  }

  if (targetLocationId) {
    const customerIds = await Booking.distinct('customer', {
      location: new mongoose.Types.ObjectId(targetLocationId),
    });
    filter['_id'] = { $in: customerIds };
  }

  // Search filter across name, phone, and email
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const searchConditions = [{ name: regex }, { number: regex }, { email: regex }];
    if (filter['_id']) {
      filter['$and'] = [{ _id: filter['_id'] }, { $or: searchConditions }];
      delete filter['_id'];
    } else {
      filter['$or'] = searchConditions;
    }
  }

  const [customers, totalDocuments] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: customers,
    customers,
    totalDocuments,
    page,
    limit,
    totalPages: Math.ceil(totalDocuments / limit),
  });
});

/**
 * GET /api/customers/:id — get single customer
 */
export const getCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid customer ID');
  }

  const customer = await Customer.findById(id).lean();
  if (!customer) throw new NotFoundError('Customer');

  sendSuccess(res, { customer });
});

/**
 * DELETE /api/customers/:id — delete customer (SuperAdmin only)
 */
export const deleteCustomer = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid customer ID');
  }

  const customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw new NotFoundError('Customer');

  sendSuccess(res, { message: 'Customer deleted successfully' });
});
