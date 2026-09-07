import type { Request, Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { ValidationError } from '../../shared/errors/AppError';
import {
  createAdminBookingService,
  createCustomerBookingService,
  getBookingsService,
  getBookingByIdService,
  deleteBookingService,
  getBookedSlotsService,
  getDashboardInfoService,
  getGraphDataService,
} from './booking.service';
import {
  CreateBookingSchema,
  UpdateBookingSchema,
  GetBookingsQuerySchema,
  GetBookedSlotsSchema,
} from './booking.validators';
import { Types } from 'mongoose';

/** GET /api/bookings — list bookings (admin) */
export const getBookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const queryParsed = GetBookingsQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    throw new ValidationError('Invalid query parameters', queryParsed.error.issues);
  }

  const locationId = req.user?.superAdmin
    ? (queryParsed.data.location ? new Types.ObjectId(queryParsed.data.location) : undefined)
    : (req.user?.locationId ? new Types.ObjectId(req.user.locationId) : null);

  const result = await getBookingsService(queryParsed.data, locationId as Types.ObjectId | null | undefined);
  sendSuccess(res, result);
});

/** GET /api/bookings/:id — single booking */
export const getBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const booking = await getBookingByIdService(id);
  sendSuccess(res, { booking });
});

/** POST /api/bookings — create admin booking (skips payment) */
export const createAdminBooking = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parsed = CreateBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid booking data', parsed.error.issues);
    }

    const booking = await createAdminBookingService(parsed.data);
    sendSuccess(res, { booking }, 201);
  },
);

/** POST /api/bookings/customerBooking — create customer booking (returns Razorpay order) */
export const createCustomerBooking = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const parsed = CreateBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid booking data', parsed.error.issues);
    }

    const result = await createCustomerBookingService(parsed.data);
    sendSuccess(res, {
      booking: result.booking,
      razorpayOrderId: result.razorpayOrderId,
    }, 201);
  },
);

/** PUT /api/bookings — update existing booking (admin) */
export const updateBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = UpdateBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Invalid booking data', parsed.error.issues);
  }

  // For updates, rebuild using price recalculation
  // Map the update DTO to the create format for price calculation
  const createCompatible = CreateBookingSchema.safeParse({
    ...parsed.data,
    customer: req.body.customer ?? { name: 'Admin Update', number: '0000000000', email: 'update@miniflicks.in' },
  });
  if (!createCompatible.success) {
    throw new ValidationError('Invalid booking data for update', createCompatible.error.issues);
  }
  const booking = await createAdminBookingService(createCompatible.data);
  sendSuccess(res, { booking });
});

/** DELETE /api/bookings/:id — delete booking (admin) */
export const deleteBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  await deleteBookingService(id);
  sendSuccess(res, { message: 'Booking deleted successfully' });
});

/** POST /api/bookings/getBookedSlots — get booked slots for a screen on a date */
export const getBookedSlots = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = GetBookedSlotsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError('Invalid request data', parsed.error.issues);
  }

  const slots = await getBookedSlotsService(parsed.data.screenId, parsed.data.currentDate);
  sendSuccess(res, { bookedSlots: slots });
});

/** GET /api/bookings/info — dashboard summary stats */
export const getDashboardInfo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const isSuperAdmin = Boolean(req.user?.superAdmin);
    let locationId: Types.ObjectId | null = null;

    if (!isSuperAdmin) {
      locationId = req.user?.locationId ? new Types.ObjectId(req.user.locationId) : null;
    } else if (req.query.location) {
      locationId = new Types.ObjectId(req.query.location as string);
    }

    const { fromDate, toDate, status } = req.query as {
      fromDate?: string;
      toDate?: string;
      status?: string;
    };

    const info = await getDashboardInfoService(
      locationId,
      fromDate,
      toDate,
      status,
      isSuperAdmin,
    );
    sendSuccess(res, { info });
  },
);

/** GET /api/bookings/graphData — revenue distribution and timeline trends */
export const getGraphData = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const isSuperAdmin = Boolean(req.user?.superAdmin);
  let locationId: Types.ObjectId | null = null;

  if (!isSuperAdmin) {
    locationId = req.user?.locationId ? new Types.ObjectId(req.user.locationId) : null;
  } else if (req.query.location) {
    locationId = new Types.ObjectId(req.query.location as string);
  }

  const { fromDate, toDate } = req.query as {
    fromDate?: string;
    toDate?: string;
  };

  const data = await getGraphDataService(
    locationId,
    fromDate,
    toDate,
    isSuperAdmin,
  );
  sendSuccess(res, { data });
});
