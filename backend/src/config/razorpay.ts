import Razorpay from 'razorpay';
import { config } from './env';

let razorpayInstance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
}

/**
 * Returns the raw Razorpay key secret from config (not from SDK instance).
 * Used for HMAC signature verification — accessing the secret from the
 * SDK instance property is not a documented/stable API.
 */
export function getRazorpaySecret(): string {
  return config.razorpay.keySecret;
}
