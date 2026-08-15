// ARC.BD Transactional Email Service
// Minimal, clean, developer-focused design with brand ARC logo
import { Resend } from "resend";
import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getFromAddress(): string {
  const rawFrom = (process.env.EMAIL_FROM || process.env.SMTP_FROM || "").trim().replace(/^["']|["']$/g, "");
  if (rawFrom && rawFrom.includes("@")) {
    return rawFrom;
  }
  return "ARC.BD <noreply@arc.bd>";
}

const REPLY_TO = "support@arc.bd";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://arc.bd";

/**
 * Check if real email delivery provider is configured
 */
export function isEmailServiceConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY ||
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  );
}

/**
 * Generic email dispatcher.
 * 1. Uses Resend SDK if RESEND_API_KEY is configured.
 * 2. Uses Nodemailer SMTP if SMTP_HOST is configured.
 * 3. Otherwise logs formatted email to server console (Dev simulation).
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const resendApiKey = (process.env.RESEND_API_KEY || "").trim().replace(/^["']|["']$/g, "");
  const smtpHost = process.env.SMTP_HOST;
  const fromAddress = getFromAddress();

  // 1. Resend SDK API
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        replyTo: REPLY_TO,
        subject,
        html,
        text,
        headers: {
          "X-Entity-Ref-ID": `arc-trans-${Date.now()}`,
          "List-Unsubscribe": `<${APP_URL}/dashboard>`,
        },
      });

      if (error) {
        console.error("[Resend Email Error]", error);
        return { success: false, error: error.message };
      }

      console.log(`[EMAIL SENT via Resend] ID: ${data?.id} -> To: ${to} | Subject: ${subject}`);
      return { success: true, id: data?.id };
    } catch (err: any) {
      console.error("[Resend Dispatch Exception]", err);
      return { success: false, error: err.message || "Resend dispatch exception" };
    }
  }

  // 2. SMTP Transport (Gmail, Brevo, AWS SES, Dokploy, etc.)
  if (smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = parseInt(process.env.SMTP_PORT || "587");
      const secure = process.env.SMTP_SECURE === "true" || port === 465;

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        replyTo: REPLY_TO,
        subject,
        html,
        text,
        headers: {
          "X-Entity-Ref-ID": `arc-trans-${Date.now()}`,
          "List-Unsubscribe": `<${APP_URL}/dashboard>`,
        },
      });

      console.log(`[EMAIL SENT via SMTP] MessageId: ${info.messageId} -> To: ${to} | Subject: ${subject}`);
      return { success: true, id: info.messageId };
    } catch (smtpErr: any) {
      console.error("[SMTP Dispatch Exception]", smtpErr);
      return { success: false, error: smtpErr.message || "SMTP dispatch error" };
    }
  }

  // 3. Fallback: Dev Simulation Mode
  console.log("\n=======================================================");
  console.log(`⚠️  [EMAIL NOTICE - NO MAIL PROVIDER CONFIGURED]`);
  console.log(`To send real emails to inboxes, set either RESEND_API_KEY or SMTP variables in .env.local.`);
  console.log(`To: ${to}`);
  console.log(`From: ${fromAddress}`);
  console.log(`Subject: ${subject}`);
  console.log(`-------------------------------------------------------`);
  console.log(text);
  console.log("=======================================================\n");

  return { success: true, id: `sim-${Date.now()}` };
}

/**
 * Clean, Seamless & Edge-to-Edge Minimal Template (No unnecessary outer spacing)
 */
function emailLayout(title: string, preheaderText: string, contentHtml: string): string {
  const logoUrl = "https://pub-6f3e39e02b3f4c84b240db2dbc06e491.r2.dev/ARC.webp";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="dark light" />
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0e1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; font-size: 1px; color: #0e1117; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheaderText}
  </div>

  <!-- Full-width container (eliminates outer letterbox borders) -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0e1117; margin: 0; padding: 0; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 16px 12px;">
        
        <!-- Main Content (Fills available width smoothly up to 560px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #151923; border: 1px solid #232a3b; border-radius: 12px; overflow: hidden;">
          
          <!-- Header with Brand Logo -->
          <tr>
            <td style="padding: 20px 24px 16px 24px; border-bottom: 1px solid #232a3b;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 10px;">
                          <img src="${logoUrl}" alt="ARC.BD" width="28" height="28" style="display: block; border-radius: 6px; width: 28px; height: 28px; object-fit: contain;" />
                        </td>
                        <td style="vertical-align: middle;">
                          <span style="font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">ARC<span style="color: #60a5fa;">.BD</span></span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11px; color: #64748b; font-weight: 500; letter-spacing: 0.3px;">Developer Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 24px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Minimal Footer -->
          <tr>
            <td style="padding: 18px 24px; background-color: #10141e; border-top: 1px solid #1c2230; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; line-height: 1.4;">
                ARC.BD &mdash; Free Subdomains &amp; Authoritative DNS
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                <a href="${APP_URL}" style="color: #64748b; text-decoration: none;">arc.bd</a> &bull; 
                <a href="${APP_URL}/dashboard" style="color: #64748b; text-decoration: none;">Dashboard</a> &bull; 
                <a href="mailto:${REPLY_TO}" style="color: #64748b; text-decoration: none;">Contact Support</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 0. Send Welcome Email for new OAuth sign-ups (Google, GitHub)
 *    Called from /auth/callback after first-time sign-in is detected.
 */
export async function sendWelcomeEmail({
  to,
  userName,
}: {
  to: string;
  userName?: string;
}) {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";
  const subject = `Welcome to ARC.BD — your free subdomain platform`;
  const preheader = `You're now signed in to ARC.BD. Claim your free .arc.bd subdomain to get started.`;

  const html = emailLayout(
    subject,
    preheader,
    `
    <div style="display: inline-block; padding: 3px 10px; border-radius: 6px; background-color: rgba(96, 165, 250, 0.12); border: 1px solid rgba(96, 165, 250, 0.25); color: #60a5fa; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      🎉 Welcome
    </div>

    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.3;">
      You're in. Let's get your subdomain.
    </h1>

    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      ${greeting}
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      Your ARC.BD account is ready. You can now claim a free <strong style="color: #ffffff; font-family: monospace;">yourname.arc.bd</strong> subdomain and point it anywhere — Vercel, GitHub Pages, Netlify, or your own server.
    </p>

    <!-- Feature highlights -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1b202e; border: 1px solid #283046; border-radius: 8px; margin: 16px 0;">
      <tr>
        <td style="padding: 14px 18px;">
          <div style="font-size: 13px; color: #94a3b8; line-height: 1.7;">
            ✦ &nbsp;<span style="color: #e2e8f0;">Free subdomains</span> — no credit card required<br/>
            ✦ &nbsp;<span style="color: #e2e8f0;">Authoritative DNS</span> — A, CNAME, TXT records<br/>
            ✦ &nbsp;<span style="color: #e2e8f0;">1-click presets</span> — Vercel, GitHub Pages, Netlify
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 18px 0 6px 0;">
      <tr>
        <td align="center" style="border-radius: 6px; background-color: #2563eb;">
          <a href="${APP_URL}/dashboard/domains" target="_blank" style="display: inline-block; padding: 10px 22px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Claim your subdomain &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="margin: 16px 0 0 0; font-size: 12px; line-height: 1.5; color: #64748b;">
      Questions? Reply to this email or reach us at <a href="mailto:${REPLY_TO}" style="color: #60a5fa; text-decoration: none;">${REPLY_TO}</a>.
    </p>
    `
  );

  const text = `
${greeting}

Welcome to ARC.BD! Your account is ready.

Claim a free yourname.arc.bd subdomain and point it anywhere:
${APP_URL}/dashboard/domains

Features:
- Free subdomains (no credit card required)
- Authoritative DNS — A, CNAME, TXT records
- 1-click presets for Vercel, GitHub Pages, Netlify

Questions? Contact ${REPLY_TO}

--
ARC.BD Team
https://arc.bd
`;

  return await sendEmail({ to, subject, html, text });
}

/**
 * 1. Send Claim Received (Pending Review) Email
 */
export async function sendClaimPendingEmail({
  to,
  userName,
  domainName,
  fullDomain,
}: {
  to: string;
  userName?: string;
  domainName: string;
  fullDomain: string;
}) {
  const greeting = userName ? `Hi ${userName},` : "Hi,";
  const subject = `[ARC.BD] We received your claim for ${fullDomain}`;
  const preheader = `Your domain claim for ${fullDomain} is queued for verification.`;

  const html = emailLayout(
    subject,
    preheader,
    `
    <div style="display: inline-block; padding: 3px 10px; border-radius: 6px; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.25); color: #fbbf24; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      ⏳ Pending Review
    </div>

    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.3;">
      Domain Claim Received
    </h1>

    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      ${greeting}
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      Your claim for <strong style="color: #ffffff;">${fullDomain}</strong> has been received and queued for administrator verification.
    </p>

    <!-- Subdomain Card Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1b202e; border: 1px solid #283046; border-radius: 8px; margin: 16px 0;">
      <tr>
        <td style="padding: 14px 18px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 3px;">Requested Subdomain</div>
          <div style="font-size: 15px; font-weight: 700; color: #60a5fa; font-family: monospace;">${fullDomain}</div>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
      DNS controls are locked while under review. You will receive an email notification as soon as your domain is approved and unlocked.
    </p>

    <!-- Minimal Button -->
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 18px 0 6px 0;">
      <tr>
        <td align="center" style="border-radius: 6px; background-color: #2563eb;">
          <a href="${APP_URL}/dashboard/domains" target="_blank" style="display: inline-block; padding: 10px 22px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
            View in Dashboard &rarr;
          </a>
        </td>
      </tr>
    </table>
    `
  );

  const text = `
${greeting}

Your domain claim for ${fullDomain} has been received and is queued for verification.

Subdomain: ${fullDomain}
Status: Pending Review

DNS management is locked until approved. You will receive another notification once unlocked.

Dashboard: ${APP_URL}/dashboard/domains

--
ARC.BD Team
https://arc.bd
`;

  return await sendEmail({ to, subject, html, text });
}

/**
 * 2. Send Claim Approved & DNS Unlocked Email
 */
export async function sendClaimApprovedEmail({
  to,
  userName,
  domainName,
  fullDomain,
  domainId,
}: {
  to: string;
  userName?: string;
  domainName: string;
  fullDomain: string;
  domainId?: string;
}) {
  const greeting = userName ? `Hi ${userName},` : "Hi,";
  const subject = `[ARC.BD] Your domain ${fullDomain} has been approved!`;
  const preheader = `Your domain ${fullDomain} is approved and DNS management is unlocked.`;
  const manageUrl = domainId ? `${APP_URL}/dashboard/domains/${domainId}` : `${APP_URL}/dashboard/domains`;

  const html = emailLayout(
    subject,
    preheader,
    `
    <div style="display: inline-block; padding: 3px 10px; border-radius: 6px; background-color: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); color: #34d399; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      ✓ Approved &amp; Unlocked
    </div>

    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.3;">
      Domain Claim Approved
    </h1>

    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      ${greeting}
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      Great news! Your domain claim for <strong style="color: #ffffff;">${fullDomain}</strong> has been approved by our administrators.
    </p>

    <!-- Subdomain Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1b202e; border: 1px solid #283046; border-radius: 8px; margin: 16px 0;">
      <tr>
        <td style="padding: 14px 18px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 3px;">Active Subdomain</div>
          <div style="font-size: 15px; font-weight: 700; color: #34d399; font-family: monospace;">${fullDomain}</div>
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 18px 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
      DNS management is now unlocked. You can configure custom A, CNAME, and TXT records or use 1-click presets for Vercel, GitHub Pages, and Netlify.
    </p>

    <!-- CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 18px 0 6px 0;">
      <tr>
        <td align="center" style="border-radius: 6px; background-color: #10b981;">
          <a href="${manageUrl}" target="_blank" style="display: inline-block; padding: 10px 22px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Configure DNS Records &rarr;
          </a>
        </td>
      </tr>
    </table>
    `
  );

  const text = `
${greeting}

Great news! Your domain claim for ${fullDomain} has been APPROVED.

Subdomain: ${fullDomain}
Status: Active & Unlocked

Configure your DNS records:
${manageUrl}

--
ARC.BD Team
https://arc.bd
`;

  return await sendEmail({ to, subject, html, text });
}

/**
 * 3. Send Claim Rejected / Suspended Email
 */
export async function sendClaimRejectedEmail({
  to,
  userName,
  domainName,
  fullDomain,
  reason,
}: {
  to: string;
  userName?: string;
  domainName: string;
  fullDomain: string;
  reason?: string;
}) {
  const greeting = userName ? `Hi ${userName},` : "Hi,";
  const subject = `[ARC.BD] Update on domain claim: ${fullDomain}`;
  const preheader = `Status update regarding your domain request for ${fullDomain}.`;

  const html = emailLayout(
    subject,
    preheader,
    `
    <div style="display: inline-block; padding: 3px 10px; border-radius: 6px; background-color: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
      ✕ Request Declined
    </div>

    <h1 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 700; color: #ffffff; line-height: 1.3;">
      Domain Request Update
    </h1>

    <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      ${greeting}
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      We are writing to let you know that your claim request for <strong style="color: #ffffff;">${fullDomain}</strong> could not be approved at this time.
    </p>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1b202e; border: 1px solid #283046; border-radius: 8px; margin: 16px 0;">
      <tr>
        <td style="padding: 14px 18px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 3px;">Subdomain</div>
          <div style="font-size: 15px; font-weight: 700; color: #f87171; font-family: monospace;">${fullDomain}</div>
        </td>
      </tr>
    </table>

    ${
      reason
        ? `
    <div style="background-color: rgba(35, 23, 28, 0.6); border-left: 3px solid #ef4444; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 16px 0; font-size: 13px; line-height: 1.5; color: #e2e8f0;">
      <strong>Reason:</strong> ${reason}
    </div>
    `
        : ""
    }

    <p style="margin: 16px 0 0 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
      If you believe this was in error, please reply directly to this email or reach us at <a href="mailto:${REPLY_TO}" style="color: #60a5fa; text-decoration: none;">${REPLY_TO}</a>.
    </p>
    `
  );

  const text = `
${greeting}

Your claim request for ${fullDomain} could not be approved at this time.
${reason ? `Reason: ${reason}\n` : ""}

If you believe this was in error, please contact ${REPLY_TO}.

--
ARC.BD Team
https://arc.bd
`;

  return await sendEmail({ to, subject, html, text });
}
