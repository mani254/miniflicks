import cron from 'node-cron';
import { cancelExpiredPendingBookings } from '../modules/bookings/booking.service';
import { getYesterdayBookingEmails, getBookingsFrom360DaysAgo } from '../modules/bookings/booking.service';
import { sendMail, buildReviewRequestHtml, buildReminderHtml } from '../infrastructure/mail/mailer';

/**
 * Runs every minute — cancels booking sessions where payment was not completed
 * within the configured window (default: 10 minutes).
 *
 * This replaces the unreliable per-booking setTimeout (C5 fix).
 * Cron job is persistent across server restarts.
 */
export function startPendingBookingCancellationJob(): void {
  cron.schedule('* * * * *', async () => {
    try {
      await cancelExpiredPendingBookings();
    } catch (err) {
      console.error('[Job] pendingBookingCancellation error:', err);
    }
  });
  console.log('[Job] Pending booking cancellation cron started (every 1 minute)');
}

/**
 * Runs daily at 10:00 AM — sends review request emails to customers
 * who had a booking yesterday.
 */
export function startReviewEmailJob(): void {
  cron.schedule('0 10 * * *', async () => {
    console.log('[Job] Sending review emails...');
    try {
      const emails = await getYesterdayBookingEmails();
      if (!emails.length) return;

      for (const email of emails) {
        await sendMail({
          to: email,
          subject: 'How was your MiniFlicks experience? 🎬',
          html: buildReviewRequestHtml('valued customer'),
        });
      }
      console.log(`[Job] Sent review emails to ${emails.length} customer(s)`);
    } catch (err) {
      console.error('[Job] reviewEmail error:', err);
    }
  });
  console.log('[Job] Review email cron started (daily at 10:00 AM)');
}

/**
 * Runs daily at 11:00 AM — sends anniversary reminder emails to customers
 * who had a booking ~360 days ago.
 */
export function startReminderEmailJob(): void {
  cron.schedule('0 11 * * *', async () => {
    console.log('[Job] Sending anniversary reminder emails...');
    try {
      const bookings = await getBookingsFrom360DaysAgo();
      if (!bookings.length) return;

      for (const booking of bookings) {
        if (!booking.customer) continue;
        await sendMail({
          to: booking.customer,
          subject: 'It\'s been a year! Create new MiniFlicks memories 🎉',
          html: buildReminderHtml('valued customer', new Date(booking.date).toLocaleDateString('en-IN')),
        });
      }
      console.log(`[Job] Sent reminder emails to ${bookings.length} customer(s)`);
    } catch (err) {
      console.error('[Job] reminderEmail error:', err);
    }
  });
  console.log('[Job] Reminder email cron started (daily at 11:00 AM)');
}

export function startAllJobs(): void {
  startPendingBookingCancellationJob();
  startReviewEmailJob();
  startReminderEmailJob();
}
