import { Router, type NextFunction, type Request, type Response } from 'express';
import { z } from 'zod';
import { sendMail } from '../../infrastructure/mail/mailer';

const contactRouter = Router();

const ContactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().min(5, 'Valid phone number is required'),
  email: z.string().trim().email('Valid email address is required'),
  message: z.string().trim().min(1, 'Message is required'),
});

function generateContactEmailHtml(data: {
  name: string;
  phone: string;
  email: string;
  message: string;
}): string {
  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">MINIFLICKS</h1>
        <p style="color: #bfdbfe; margin: 0; font-size: 14px; font-weight: 500;">New Contact Form Inquiry</p>
      </div>

      <div style="padding: 28px 24px;">
        <p style="color: #374151; font-size: 15px; line-height: 1.5; margin-top: 0;">
          You have received a new inquiry from the website contact form:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tbody>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600; width: 100px;">NAME</td>
              <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">${escapeHtml(data.name)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600;">PHONE</td>
              <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">
                <a href="tel:${escapeHtml(data.phone)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.phone)}</a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600;">EMAIL</td>
              <td style="padding: 10px 0; color: #111827; font-size: 14px; font-weight: 600;">
                <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(data.email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 13px; font-weight: 600;">SUBMITTED</td>
              <td style="padding: 10px 0; color: #4b5563; font-size: 13px;">${timestamp} (IST)</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 24px;">
          <label style="display: block; color: #6b7280; font-size: 13px; font-weight: 600; margin-bottom: 8px;">MESSAGE</label>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; color: #1f2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${escapeHtml(data.message)}
          </div>
        </div>
      </div>

      <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 24px; text-align: center; color: #9ca3af; font-size: 12px;">
        This automated notification was generated from the MiniFlicks Website Contact Page.
      </div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function handleContactSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parseResult = ContactFormSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
      res.status(400).json({ success: false, error: errorMsg });
      return;
    }

    const { name, phone, email, message } = parseResult.data;
    const recipientEmail = 'msmanikanta25@gmail.com';

    const htmlContent = generateContactEmailHtml({ name, phone, email, message });

    const sent = await sendMail({
      to: recipientEmail,
      subject: `New Miniflicks Contact Form Inquiry: ${name}`,
      html: htmlContent,
    });

    if (!sent) {
      console.error('[ContactForm] Email failed to send to:', recipientEmail);
      res.status(500).json({
        success: false,
        error: 'Unable to deliver message at this time. Please contact us directly via phone or WhatsApp.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Message Sent Successfully',
    });
  } catch (err) {
    next(err);
  }
}

// Handlers for both /api/contact and legacy /sendContactForm
contactRouter.post('/', handleContactSubmission);
contactRouter.post('/sendContactForm', handleContactSubmission);

export default contactRouter;
