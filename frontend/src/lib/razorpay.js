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
  timeoutSeconds = 600, // 10 minutes timeout (matches backend pending booking session)
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error('Razorpay SDK failed to load. Please check your connection.');
  }

  return new Promise((resolve, reject) => {
    let timer = null;
    let isSettled = false;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const options = {
      key: keyId,
      amount: amountPaise,
      currency: 'INR',
      name: 'MiniFlicks',
      description,
      order_id: orderId,
      timeout: timeoutSeconds, // Razorpay SDK timeout in seconds (10 min)
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerNumber,
      },
      theme: {
        color: '#E50914',
      },
      handler: function (response) {
        if (isSettled) return;
        isSettled = true;
        cleanup();
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          if (isSettled) return;
          isSettled = true;
          cleanup();
          const err = new Error('Payment window closed or cancelled');
          err.isDismissed = true;
          reject(err);
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);

    razorpayInstance.on('payment.failed', function (response) {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(new Error(response.error?.description || 'Payment failed'));
    });

    // 10-minute client-side timer fallback: close modal and reject on timeout
    timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      try {
        if (typeof razorpayInstance.close === 'function') {
          razorpayInstance.close();
        }
      } catch (closeErr) {
        console.warn('Error closing Razorpay modal on timeout:', closeErr);
      }
      const err = new Error('Payment session timed out after 10 minutes. Please select your slot and try again.');
      err.isTimeout = true;
      reject(err);
    }, timeoutSeconds * 1000);

    razorpayInstance.open();
  });
}
