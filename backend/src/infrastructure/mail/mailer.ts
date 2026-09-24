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

export interface BookingConfirmationEmailParams {
  bookingId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  date: string;
  slot: { from: string; to: string };
  screen: string;
  location: string;
  locationAddress?: string;
  numberOfPeople?: number;

  packageName?: string;
  packagePrice?: number;
  minPeople?: number;
  extraPersonPrice?: number;
  extraGuestsCount?: number;
  extraGuestsPrice?: number;

  occasion?: string;
  occasionPrice?: number;
  celebrantName?: string;

  cakes?: Array<{
    name: string;
    price?: number;
    free?: boolean;
    special?: boolean;
    specialPrice?: number;
  }>;
  nameOnCake?: string;
  ledName?: string;
  ledNumber?: string;
  ledExtraChars?: number;
  ledSurcharge?: number;

  addons?: Array<{ name: string; price?: number; count: number }>;
  gifts?: Array<{ name: string; price?: number; count: number }>;
  note?: string;

  couponCode?: string | null;
  couponPrice?: number;
  totalPrice: number;
  advancePrice: number;
  remainingAmount: number;
  razorpayPaymentId?: string;
  createdAt?: Date | string;
  logoUrl?: string;
}

function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function buildBookingConfirmationHtml(params: BookingConfirmationEmailParams): string {
  const invoiceRef = params.bookingId
    ? `MF-${params.bookingId.slice(-8).toUpperCase()}`
    : `MF-${Date.now().toString(36).toUpperCase()}`;

  const issueDate = params.createdAt
    ? new Date(params.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const logoUrl = params.logoUrl || 'https://miniflicks.in/assets/mf-logo-D8ebzm12.png';

  // Build itemized invoice lines
  interface InvoiceLine {
    sr: number;
    title: string;
    description?: string;
    qty: number;
    unitPrice: number;
    amount: number;
    isFree?: boolean;
  }

  const items: InvoiceLine[] = [];

  // 1. Base Package / Screen
  const packagePrice = params.packagePrice ?? 0;
  items.push({
    sr: items.length + 1,
    title: `${params.packageName || params.screen} (Base Package)`,
    description: params.minPeople
      ? `Private theatre experience with base capacity of up to ${params.minPeople} guests`
      : 'Private theatre experience and screening',
    qty: 1,
    unitPrice: packagePrice,
    amount: packagePrice,
  });

  // 2. Extra Guests
  if (params.extraGuestsCount && params.extraGuestsCount > 0) {
    const unitPrice = params.extraPersonPrice ?? 0;
    const amount = params.extraGuestsPrice ?? params.extraGuestsCount * unitPrice;
    items.push({
      sr: items.length + 1,
      title: `Additional Guest${params.extraGuestsCount > 1 ? 's' : ''}`,
      description: `${params.extraGuestsCount} extra guest${params.extraGuestsCount > 1 ? 's' : ''} (beyond ${params.minPeople || 2} base guests @ ${formatInr(unitPrice)}/person)`,
      qty: params.extraGuestsCount,
      unitPrice: unitPrice,
      amount: amount,
    });
  }

  // 3. Occasion Decor
  if (params.occasion) {
    const occPrice = params.occasionPrice ?? 0;
    items.push({
      sr: items.length + 1,
      title: `Occasion Decor: ${params.occasion}`,
      description: params.celebrantName
        ? `Themed celebration setup for ${params.celebrantName}`
        : 'Special themed celebration decor & ambient lighting',
      qty: 1,
      unitPrice: occPrice,
      amount: occPrice,
      isFree: occPrice === 0,
    });
  }

  // 4. Cakes
  if (params.cakes && params.cakes.length > 0) {
    params.cakes.forEach((cake) => {
      if (cake.free) {
        if (cake.special) {
          const specialPrice = cake.specialPrice ?? cake.price ?? 0;
          items.push({
            sr: items.length + 1,
            title: `${cake.name} (Special Cake Upgrade)`,
            description: 'Package-included slot with special premium flavour upgrade',
            qty: 1,
            unitPrice: specialPrice,
            amount: specialPrice,
          });
        } else {
          items.push({
            sr: items.length + 1,
            title: `${cake.name} (Package Included Cake)`,
            description: 'Complimentary celebration cake included in your package',
            qty: 1,
            unitPrice: 0,
            amount: 0,
            isFree: true,
          });
        }
      } else {
        const cakePrice = cake.price ?? 0;
        items.push({
          sr: items.length + 1,
          title: `${cake.name} (Celebration Cake)`,
          description: 'Fresh bakery celebration cake',
          qty: 1,
          unitPrice: cakePrice,
          amount: cakePrice,
        });
      }
    });
  }

  // 5. LED Name Surcharge
  if (params.ledExtraChars && params.ledExtraChars > 0 && params.ledSurcharge && params.ledSurcharge > 0) {
    items.push({
      sr: items.length + 1,
      title: `LED Name Letters Surcharge`,
      description: `Name "${params.ledName}": ${params.ledExtraChars} letter${params.ledExtraChars > 1 ? 's' : ''} beyond 8 free characters @ ₹30/letter`,
      qty: params.ledExtraChars,
      unitPrice: 30,
      amount: params.ledSurcharge,
    });
  }

  // 6. Add-ons
  if (params.addons && params.addons.length > 0) {
    params.addons.forEach((addon) => {
      const price = addon.price ?? 0;
      const count = addon.count ?? 1;
      items.push({
        sr: items.length + 1,
        title: `Add-on: ${addon.name}`,
        description: 'Selected celebration add-on service',
        qty: count,
        unitPrice: price,
        amount: price * count,
      });
    });
  }

  // 7. Gifts
  if (params.gifts && params.gifts.length > 0) {
    params.gifts.forEach((gift) => {
      const price = gift.price ?? 0;
      const count = gift.count ?? 1;
      items.push({
        sr: items.length + 1,
        title: `Gift: ${gift.name}`,
        description: 'Celebration gift item',
        qty: count,
        unitPrice: price,
        amount: price * count,
      });
    });
  }

  const calculatedSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const couponDiscount = params.couponPrice ? Math.abs(params.couponPrice) : 0;
  const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : params.totalPrice + couponDiscount;

  const itemRowsHtml = items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td align="left" style="padding: 12px 10px; font-size: 12px; color: #64748b; vertical-align: top;">${item.sr}</td>
          <td align="left" style="padding: 12px 10px; vertical-align: top;">
            <div style="font-size: 13px; font-weight: 600; color: #0f172a;">${escapeHtml(item.title)}</div>
            ${item.description ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px; line-height: 1.4;">${escapeHtml(item.description)}</div>` : ''}
          </td>
          <td align="center" style="padding: 12px 10px; font-size: 13px; color: #334155; vertical-align: top;">${item.qty}</td>
          <td align="right" style="padding: 12px 10px; font-size: 13px; color: #334155; vertical-align: top;">
            ${item.isFree ? '<span style="color: #059669; font-weight: 700; font-size: 11px;">FREE</span>' : formatInr(item.unitPrice)}
          </td>
          <td align="right" style="padding: 12px 10px; font-size: 13px; font-weight: 700; color: #0f172a; vertical-align: top;">
            ${item.isFree ? '<span style="display: inline-block; color: #059669; font-weight: 700; font-size: 11px; background-color: #ecfdf5; padding: 2px 7px; border-radius: 4px; border: 1px solid #a7f3d0;">₹0 (FREE)</span>' : formatInr(item.amount)}
          </td>
        </tr>
      `,
    )
    .join('');

  const hasCelebrationDetails = Boolean(
    params.occasion || params.nameOnCake || params.ledName || params.ledNumber || params.note,
  );

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - MiniFlicks Private Theatres</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center style="width: 100%; background-color: #f1f5f9;">
    <!-- Outer wrapper table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 32px 12px; margin: 0;">
      <tr>
        <td align="center">
          <!-- Main Invoice White Card with strict min-width and max-width -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="650" style="width: 650px; min-width: 600px; max-width: 680px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06); overflow: hidden; table-layout: fixed; text-align: left;">
            
            <!-- Top Gradient Accent Strip -->
            <tr>
              <td height="5" style="background: linear-gradient(90deg, #6461ae 0%, #a855f7 50%, #ec4899 100%); font-size: 0; line-height: 0;">&nbsp;</td>
            </tr>

            <!-- Header Section with Official Logo & Tax Invoice Metadata -->
            <tr>
              <td style="padding: 28px 32px 20px; border-bottom: 1px solid #e2e8f0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td valign="top" style="width: 52%;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="middle" style="padding-right: 12px;">
                            <a href="https://miniflicks.in" target="_blank" style="text-decoration: none; display: block;">
                              <img src="${logoUrl}" alt="MiniFlicks" width="60" style="display: block; width: 60px; max-width: 60px; height: auto; border: 0; outline: none;" />
                            </a>
                          </td>
                          <td valign="middle">
                            <a href="https://miniflicks.in" target="_blank" style="text-decoration: none;">
                              <div style="font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-transform: lowercase;">miniflicks</div>
                            </a>
                            <div style="font-size: 10px; color: #64748b; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 4px; font-weight: 700;">Private Theater &amp; Celebrations</div>
                          </td>
                        </tr>
                      </table>
                      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
                        Website: <a href="https://miniflicks.in" target="_blank" style="color: #6461ae; text-decoration: none; font-weight: 600;">miniflicks.in</a>
                      </div>
                    </td>
                    <td valign="top" align="right" style="width: 48%;">
                      <div style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase;">TAX INVOICE</div>
                      <div style="font-size: 13px; color: #475569; margin-top: 5px;">
                        Invoice #: <strong style="color: #0f172a; font-family: 'Courier New', Courier, monospace; letter-spacing: 0.5px;">${invoiceRef}</strong>
                      </div>
                      <div style="font-size: 12px; color: #64748b; margin-top: 3px;">
                        Issue Date: <span style="color: #1e293b; font-weight: 600;">${issueDate}</span>
                      </div>
                      <div style="margin-top: 8px;">
                        <span style="display: inline-block; padding: 4px 12px; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; border-radius: 9999px; border: 1px solid #a7f3d0; text-transform: uppercase; letter-spacing: 0.5px;">
                          ✓ Booking Confirmed
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Welcome / Confirmation Notice -->
            <tr>
              <td style="padding: 20px 32px 14px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-left: 4px solid #6461ae; border-radius: 6px; padding: 14px 18px;">
                  <tr>
                    <td>
                      <div style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 4px;">
                        Hello ${escapeHtml(params.customerName)}, your reservation is confirmed! 🎉
                      </div>
                      <div style="font-size: 13px; color: #475569; line-height: 1.5;">
                        Thank you for choosing <strong>MiniFlicks</strong>. Please find your detailed booking tax invoice and itinerary below. Kindly show this receipt at the theatre reception.
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- 2-Column Info Grid: Billed To & Venue / Schedule -->
            <tr>
              <td style="padding: 6px 32px 18px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <!-- Left: Billed To -->
                    <td valign="top" width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
                      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                        BILLED TO (GUEST)
                      </div>
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                        ${escapeHtml(params.customerName)}
                      </div>
                      ${params.customerPhone ? `
                        <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                          📱 +91 ${escapeHtml(params.customerPhone)}
                        </div>
                      ` : ''}
                      ${params.customerEmail ? `
                        <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                          ✉️ ${escapeHtml(params.customerEmail)}
                        </div>
                      ` : ''}
                      <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                        👥 <strong>${params.numberOfPeople || 2} Guests</strong> reserved
                      </div>
                    </td>

                    <td width="4%">&nbsp;</td>

                    <!-- Right: Venue & Showtime -->
                    <td valign="top" width="48%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
                      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                        THEATRE & SHOWTIME
                      </div>
                      <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
                        ${escapeHtml(params.screen)}
                      </div>
                      <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                        📅 Date: <strong>${escapeHtml(params.date)}</strong>
                      </div>
                      <div style="font-size: 12px; color: #475569; margin-bottom: 3px;">
                        ⏰ Slot: <strong>${escapeHtml(params.slot.from)} – ${escapeHtml(params.slot.to)}</strong>
                      </div>
                      <div style="font-size: 12px; color: #475569; margin-top: 4px;">
                        📍 ${escapeHtml(params.location)}${params.locationAddress ? ` · ${escapeHtml(params.locationAddress)}` : ''}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Celebration & Customization Details (Conditional) -->
            ${hasCelebrationDetails ? `
            <tr>
              <td style="padding: 0 32px 18px;">
                <div style="background-color: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 12px 16px;">
                  <div style="font-size: 11px; font-weight: 700; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
                    CELEBRATION DETAILS & CUSTOMIZATIONS
                  </div>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 12px; color: #3b0764;">
                    ${params.occasion ? `
                      <tr>
                        <td style="padding: 3px 0; width: 140px; color: #7e22ce; font-weight: 600;">Occasion:</td>
                        <td style="padding: 3px 0; font-weight: 700;">
                          ${escapeHtml(params.occasion)}${params.celebrantName ? ` (Celebrant: ${escapeHtml(params.celebrantName)})` : ''}
                        </td>
                      </tr>
                    ` : ''}
                    ${params.nameOnCake ? `
                      <tr>
                        <td style="padding: 3px 0; color: #7e22ce; font-weight: 600;">Name on Cake:</td>
                        <td style="padding: 3px 0; font-weight: 700;">"${escapeHtml(params.nameOnCake)}"</td>
                      </tr>
                    ` : ''}
                    ${params.ledName || params.ledNumber ? `
                      <tr>
                        <td style="padding: 3px 0; color: #7e22ce; font-weight: 600;">LED Signs:</td>
                        <td style="padding: 3px 0; font-weight: 700;">
                          ${[
          params.ledName ? `Name: "${escapeHtml(params.ledName)}"` : '',
          params.ledNumber ? `Number: "${escapeHtml(params.ledNumber)}"` : '',
        ]
          .filter(Boolean)
          .join(' · ')}
                        </td>
                      </tr>
                    ` : ''}
                    ${params.note ? `
                      <tr>
                        <td style="padding: 3px 0; color: #7e22ce; font-weight: 600;">Special Request:</td>
                        <td style="padding: 3px 0; font-style: italic;">"${escapeHtml(params.note)}"</td>
                      </tr>
                    ` : ''}
                  </table>
                </div>
              </td>
            </tr>
            ` : ''}

            <!-- Itemized Pricing Breakdown Table -->
            <tr>
              <td style="padding: 0 32px 10px;">
                <div style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px;">
                  ITEMIZED PRICING BREAKDOWN
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; width: 100%;">
                  <thead>
                    <tr style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #cbd5e1;">
                      <th align="left" style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; width: 35px;">#</th>
                      <th align="left" style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; width: 290px;">Item Description</th>
                      <th align="center" style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; width: 45px;">Qty</th>
                      <th align="right" style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; width: 95px;">Rate</th>
                      <th align="right" style="padding: 10px 8px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; width: 115px;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRowsHtml}
                  </tbody>
                </table>
              </td>
            </tr>

            <!-- Financial Settlement & Totals Block -->
            <tr>
              <td style="padding: 8px 32px 24px;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <!-- Settlement Box -->
                    <td width="42%" valign="top" style="padding-top: 8px;">
                      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px 14px;">
                        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
                          Payment Settlement
                        </div>
                        <div style="font-size: 12px; color: #334155; line-height: 1.5;">
                          Advance Paid Online: <strong style="color: #059669;">${formatInr(params.advancePrice)}</strong>
                          ${params.razorpayPaymentId ? `
                            <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-top: 2px;">
                              Payment ID: ${escapeHtml(params.razorpayPaymentId)}
                            </div>
                          ` : ''}
                        </div>
                        ${params.remainingAmount > 0 ? `
                          <div style="margin-top: 10px; font-size: 11px; color: #b45309; font-weight: 600; line-height: 1.4;">
                            ⚠️ Balance of <strong>${formatInr(params.remainingAmount)}</strong> payable at reception upon arrival via UPI or Cash.
                          </div>
                        ` : `
                          <div style="margin-top: 10px; font-size: 11px; color: #059669; font-weight: 600;">
                            ✓ Fully paid online. No pending balance due at venue.
                          </div>
                        `}
                      </div>
                    </td>

                    <td width="6%">&nbsp;</td>

                    <!-- Summary Totals -->
                    <td width="52%" valign="top">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                        <tr>
                          <td style="padding: 6px 0; color: #64748b;">Subtotal:</td>
                          <td align="right" style="padding: 6px 0; font-weight: 600; color: #1e293b;">${formatInr(subtotal)}</td>
                        </tr>
                        ${couponDiscount > 0 ? `
                        <tr>
                          <td style="padding: 6px 0; color: #059669;">
                            Coupon Discount ${params.couponCode ? `(${escapeHtml(params.couponCode)})` : ''}:
                          </td>
                          <td align="right" style="padding: 6px 0; font-weight: 700; color: #059669;">
                            -${formatInr(couponDiscount)}
                          </td>
                        </tr>
                        ` : ''}
                        <tr style="border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0;">
                          <td style="padding: 10px 0; font-size: 14px; font-weight: 800; color: #0f172a;">GRAND TOTAL:</td>
                          <td align="right" style="padding: 10px 0; font-size: 17px; font-weight: 800; color: #0f172a;">
                            ${formatInr(params.totalPrice)}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #059669; font-weight: 600;">Advance Paid Online:</td>
                          <td align="right" style="padding: 8px 0; font-weight: 700; color: #059669;">
                            ${formatInr(params.advancePrice)}
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 6px;">
                            <div style="background-color: ${params.remainingAmount > 0 ? '#fffbeb' : '#ecfdf5'}; border: 1px solid ${params.remainingAmount > 0 ? '#fde68a' : '#a7f3d0'}; border-radius: 6px; padding: 10px 14px;">
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td style="font-size: 13px; font-weight: 700; color: ${params.remainingAmount > 0 ? '#92400e' : '#065f46'};">
                                    Balance Due at Venue:
                                  </td>
                                  <td align="right" style="font-size: 16px; font-weight: 800; color: ${params.remainingAmount > 0 ? '#b45309' : '#059669'};">
                                    ${formatInr(params.remainingAmount)}
                                  </td>
                                </tr>
                                ${params.remainingAmount > 0 ? `
                                <tr>
                                  <td colspan="2" style="font-size: 11px; color: #b45309; padding-top: 3px;">
                                    Payable via UPI or Cash at reception upon arrival
                                  </td>
                                </tr>
                                ` : ''}
                              </table>
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Venue Guidelines -->
            <tr>
              <td style="padding: 0 32px 24px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                  <div style="font-size: 12px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                    📌 Important Venue Guidelines
                  </div>
                  <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #64748b; line-height: 1.6;">
                    <li>Please arrive <strong>10–15 minutes</strong> prior to your scheduled slot time.</li>
                    <li>Please present this booking invoice or confirmation email at the reception desk.</li>
                    <li>Outside food and beverages are strictly not allowed inside the theatre halls.</li>
                    <li>Time slots are reserved exclusively for you; arriving on time ensures a complete screening experience.</li>
                  </ul>
                </div>
              </td>
            </tr>

            <!-- Footer Section -->
            <tr>
              <td style="background-color: #0f172a; padding: 24px 32px; text-align: center; border-radius: 0 0 12px 12px;">
                <div style="font-size: 13px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px; margin-bottom: 4px;">
                  MiniFlicks Private Theatres
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 12px;">
                  The Premier Private Cinema & Celebration Experience
                </div>
                <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 14px;">
                  Need assistance or have queries? Contact us at
                  <a href="mailto:miniflicksprivatetheatres@gmail.com" style="color: #c084fc; text-decoration: none; font-weight: 600;">miniflicksprivatetheatres@gmail.com</a>
                  or visit <a href="https://miniflicks.in" style="color: #c084fc; text-decoration: none; font-weight: 600;">miniflicks.in</a>
                </div>
                <div style="font-size: 10px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px;">
                  © ${new Date().getFullYear()} MiniFlicks. All rights reserved. This is a computer-generated tax invoice and booking receipt.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
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
