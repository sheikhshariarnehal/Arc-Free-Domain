const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY || "your_api_key_here");
const logoUrl = "https://pub-6f3e39e02b3f4c84b240db2dbc06e491.r2.dev/ARC.webp";
const APP_URL = "https://arc.bd";

async function main() {
  const { data, error } = await resend.emails.send({
    from: "ARC.BD <noreply@arc.bd>",
    to: ["nehalmahamud.dev@gmail.com"],
    replyTo: "support@arc.bd",
    subject: "Welcome to ARC.BD — your free subdomain platform",
    html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0e1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" style="background:#0e1117;padding:16px 12px;" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#151923;border:1px solid #232a3b;border-radius:12px;overflow:hidden;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:20px 24px 16px;border-bottom:1px solid #232a3b;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:10px;vertical-align:middle;">
                <img src="${logoUrl}" width="28" height="28" style="border-radius:6px;display:block;" alt="ARC.BD" />
              </td>
              <td style="vertical-align:middle;">
                <span style="font-size:16px;font-weight:700;color:#fff;letter-spacing:-0.3px;">ARC<span style="color:#60a5fa;">.BD</span></span>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:24px;">
          <div style="display:inline-block;padding:3px 10px;border-radius:6px;background:rgba(96,165,250,0.12);border:1px solid rgba(96,165,250,0.25);color:#60a5fa;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px;">
            🎉 Welcome
          </div>
          <h1 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#fff;line-height:1.3;">You're in. Let's get your subdomain.</h1>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#cbd5e1;">Hi Sheikh Shariar Nehal,</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#cbd5e1;">
            Your ARC.BD account is ready. Claim a free <strong style="color:#fff;font-family:monospace;">yourname.arc.bd</strong> subdomain and point it anywhere.
          </p>
          <table width="100%" style="background:#1b202e;border:1px solid #283046;border-radius:8px;margin:16px 0;" cellpadding="0" cellspacing="0">
            <tr><td style="padding:14px 18px;">
              <div style="font-size:13px;color:#94a3b8;line-height:1.7;">
                ✦ &nbsp;<span style="color:#e2e8f0;">Free subdomains</span> — no credit card required<br/>
                ✦ &nbsp;<span style="color:#e2e8f0;">Authoritative DNS</span> — A, CNAME, TXT records<br/>
                ✦ &nbsp;<span style="color:#e2e8f0;">1-click presets</span> — Vercel, GitHub Pages, Netlify
              </div>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:18px 0 6px;">
            <tr><td align="center" style="border-radius:6px;background:#2563eb;">
              <a href="${APP_URL}/dashboard/domains" style="display:inline-block;padding:10px 22px;font-size:13px;font-weight:600;color:#fff;text-decoration:none;border-radius:6px;">
                Claim your subdomain &rarr;
              </a>
            </td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
            Questions? Contact <a href="mailto:support@arc.bd" style="color:#60a5fa;text-decoration:none;">support@arc.bd</a>
          </p>
        </td></tr>
        <tr><td style="padding:18px 24px;background:#10141e;border-top:1px solid #1c2230;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#64748b;">ARC.BD &mdash; Free Subdomains &amp; Authoritative DNS</p>
          <p style="margin:0;font-size:11px;color:#475569;">
            <a href="${APP_URL}" style="color:#64748b;text-decoration:none;">arc.bd</a> &bull;
            <a href="${APP_URL}/dashboard" style="color:#64748b;text-decoration:none;">Dashboard</a> &bull;
            <a href="mailto:support@arc.bd" style="color:#64748b;text-decoration:none;">Contact Support</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: "Hi Sheikh Shariar Nehal,\n\nWelcome to ARC.BD! Your account is ready.\n\nClaim a free subdomain: https://arc.bd/dashboard/domains\n\n-- ARC.BD Team",
    headers: {
      "X-Entity-Ref-ID": `arc-welcome-test-${Date.now()}`,
    },
  });

  if (error) {
    console.error("ERROR:", JSON.stringify(error, null, 2));
    process.exit(1);
  } else {
    console.log("SUCCESS! Welcome email delivered.");
    console.log("Delivery ID:", data.id);
    console.log("To: nehalmahamud.dev@gmail.com");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
