import nodemailer from 'nodemailer';
import { config } from '../../config/env';

function createTransporter() {
  if (!config.mail.user || !config.mail.pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });
}

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Send an email using SMTP (Sendinblue / Brevo / standard SMTP) + Nodemailer.
 * Errors are caught and logged — callers receive a boolean indicating success.
 * This prevents email failures from crashing the booking flow.
 */
export async function sendMail(options: MailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('[Mail] SMTP credentials not configured (SMTP_USER/SMTP_PASS missing). Skipping email.');
      return false;
    }

    await transporter.sendMail({
      from: config.mail.from,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
    });

    return true;
  } catch (error) {
    console.error('[Mail] Failed to send email:', {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export function buildBookingConfirmationHtml(params: {
  customerName: string;
  date: string;
  slot: { from: string; to: string };
  screen: string;
  location: string;
  totalPrice: number;
  advancePrice: number;
  remainingAmount: number;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #333; margin: 0;">MiniFlicks</h1>
        <p style="color: #666; margin: 4px 0 0;">Private Theater Booking Confirmation</p>
      </div>

      <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0 0 12px;">Booking Confirmed! 🎉</h2>
        <p style="color: #666; margin: 0;">Hi <strong>${params.customerName}</strong>, your booking is confirmed.</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; color: #666; width: 40%;">Date</td>
          <td style="padding: 10px 0; font-weight: bold;">${params.date}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; color: #666;">Time Slot</td>
          <td style="padding: 10px 0; font-weight: bold;">${params.slot.from} – ${params.slot.to}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; color: #666;">Screen</td>
          <td style="padding: 10px 0; font-weight: bold;">${params.screen}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; color: #666;">Location</td>
          <td style="padding: 10px 0; font-weight: bold;">${params.location}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; color: #666;">Total Amount</td>
          <td style="padding: 10px 0; font-weight: bold;">₹${params.totalPrice}</td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 0; color: #666;">Advance Paid</td>
          <td style="padding: 10px 0; color: #22c55e; font-weight: bold;">₹${params.advancePrice}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666;">Remaining Amount</td>
          <td style="padding: 10px 0; font-weight: bold;">₹${params.remainingAmount}</td>
        </tr>
      </table>

      <p style="color: #888; font-size: 13px; text-align: center; margin: 0;">
        Please arrive 10 minutes before your scheduled time. For any queries, contact us at
        <a href="mailto:support@miniflicks.in" style="color: #333;">support@miniflicks.in</a>.
      </p>
    </div>
  `;
}

export function buildReviewRequestHtml(customerName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>We hope you enjoyed your MiniFlicks experience! 🎬</h2>
      <p>Hi ${customerName},</p>
      <p>We'd love to hear about your experience. Please take a moment to leave us a review on Google:</p>
      <a href="https://g.page/miniflicks/review" style="display: inline-block; padding: 12px 24px; background: #333; color: white; text-decoration: none; border-radius: 6px;">Leave a Review</a>
      <p style="margin-top: 20px; color: #888; font-size: 13px;">Thank you for choosing MiniFlicks!</p>
    </div>
  `;
}

export function buildReminderHtml(customerName: string, bookingDate: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>It's been a year since your MiniFlicks visit! 🎉</h2>
      <p>Hi ${customerName},</p>
      <p>It's been about a year since you celebrated with us on ${bookingDate}. Time flies when you're making memories!</p>
      <p>Why not create new memories with your loved ones? Book your next private theater experience today.</p>
      <a href="https://miniflicks.in" style="display: inline-block; padding: 12px 24px; background: #333; color: white; text-decoration: none; border-radius: 6px;">Book Now</a>
    </div>
  `;
}
