/**
 * Booking status state machine.
 * Defines all valid statuses and which transitions are permitted.
 * Any attempt to move to an unlisted target status should be rejected.
 */

export const BookingStatus = {
  PENDING: 'pending',
  BOOKED: 'booked',
  CANCELED: 'canceled',
} as const;

export type BookingStatusType = (typeof BookingStatus)[keyof typeof BookingStatus];

/**
 * Map of valid state transitions.
 * Key: current status.
 * Value: statuses that the booking is allowed to move to.
 */
export const VALID_TRANSITIONS: Record<BookingStatusType, BookingStatusType[]> = {
  [BookingStatus.PENDING]: [BookingStatus.BOOKED, BookingStatus.CANCELED],
  [BookingStatus.BOOKED]: [BookingStatus.CANCELED],
  [BookingStatus.CANCELED]: [], // terminal state
};

/**
 * Returns true if transitioning from `from` to `to` is permitted.
 */
export function isValidTransition(
  from: BookingStatusType,
  to: BookingStatusType,
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
