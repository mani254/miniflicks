import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments';
import toast from 'react-hot-toast';

/**
 * Hook for payment operations
 */
export function usePayments() {
  const verifyMutation = useMutation({
    mutationFn: (data) => paymentsApi.verifyPayment(data),
    onError: (err) => {
      toast.error(err.message || 'Payment verification failed');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId) => paymentsApi.cancelPayment(orderId),
  });

  return {
    verifyPayment: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    cancelPayment: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
}
