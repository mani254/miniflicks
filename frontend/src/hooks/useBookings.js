import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/bookings';
import { toast } from 'sonner';

export const BOOKING_KEYS = {
  all: ['bookings'],
  list: (params) => ['bookings', 'list', params || {}],
  detail: (id) => ['bookings', 'detail', id],
  slots: (screenId, date) => ['bookings', 'slots', { screenId, date }],
  dashboardInfo: (params) => ['bookings', 'dashboardInfo', params || {}],
  graphData: (params) => ['bookings', 'graphData', params || {}],
};

/**
 * Hook to get booked slots for a given screen and date
 */
export function useBookedSlots(screenId, currentDate) {
  return useQuery({
    queryKey: BOOKING_KEYS.slots(screenId, currentDate),
    queryFn: () => bookingsApi.getBookedSlots({ screenId, currentDate }),
    enabled: Boolean(screenId && currentDate),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get paginated bookings for admin
 */
export function useBookings(params) {
  return useQuery({
    queryKey: BOOKING_KEYS.list(params),
    queryFn: () => bookingsApi.getBookings(params),
  });
}

/**
 * Hook to get single booking details
 */
export function useBooking(id) {
  return useQuery({
    queryKey: BOOKING_KEYS.detail(id),
    queryFn: () => bookingsApi.getBooking(id),
    enabled: Boolean(id),
  });
}

/**
 * Mutation for creating customer booking (returns Razorpay order)
 */
export function useCreateCustomerBooking() {
  return useMutation({
    mutationFn: (bookingData) => bookingsApi.createCustomerBooking(bookingData),
  });
}

/**
 * Mutation for creating admin booking (skips payment)
 */
export function useCreateAdminBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingData) => bookingsApi.createAdminBooking(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      toast.success('Booking created successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create booking');
    },
  });
}

/**
 * Mutation for updating booking
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingData) => bookingsApi.updateBooking(bookingData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      toast.success('Booking updated successfully');
      return data;
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update booking');
    },
  });
}

/**
 * Mutation for deleting booking
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => bookingsApi.deleteBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_KEYS.all });
      toast.success('Booking deleted successfully');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete booking');
    },
  });
}

/**
 * Hook for dashboard stats
 */
export function useDashboardInfo(params) {
  return useQuery({
    queryKey: BOOKING_KEYS.dashboardInfo(params),
    queryFn: () => bookingsApi.getDashboardInfo(params),
  });
}

/**
 * Hook for graph and analytics data
 */
export function useGraphData(params) {
  return useQuery({
    queryKey: BOOKING_KEYS.graphData(params),
    queryFn: () => bookingsApi.getGraphData(params),
  });
}
