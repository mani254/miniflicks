/**
 * Razorpay Checkout SDK Helper
 */

/**
 * Dynamically loads the Razorpay checkout script if not already loaded
 * @returns {Promise<boolean>}
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay Checkout modal
 * @param {object} options
 * @returns {Promise<{ razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }>}
 */
export async function openRazorpayCheckout({
  orderId,
  amountPaise,
  keyId = import.meta.env.VITE_RAZORPAY_KEY_ID,
  customerName = '',
  customerEmail = '',
  customerNumber = '',
  description = 'MiniFlicks Theatre Booking',
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error('Razorpay SDK failed to load. Please check your connection.');
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: amountPaise,
      currency: 'INR',
      name: 'MiniFlicks',
      description,
      order_id: orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerNumber,
      },
      theme: {
        color: '#E50914',
      },
      handler: function (response) {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on('payment.failed', function (response) {
      reject(new Error(response.error?.description || 'Payment failed'));
    });
    razorpayInstance.open();
  });
}
