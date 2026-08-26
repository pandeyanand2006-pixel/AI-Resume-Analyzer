const nodemailer = require("nodemailer");

let etherealTransporter = null;
let etherealAccount = null;

// Create transporter based on SMTP env vars
// Supports: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_SECURE
// Falls back to Ethereal test account + direct MX attempt if not configured
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;

  const isPlaceholder = (v) => !v || v.includes("your_") || v.includes("example") || v.trim() === "";
  if (!host || !port || !user || !pass || isPlaceholder(user) || isPlaceholder(pass) || isPlaceholder(host)) {
    return null;
  }

  const secure = process.env.SMTP_SECURE === "true" || String(port) === "465";

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: { user, pass },
  });
}

async function getEtherealTransporter() {
  if (etherealTransporter) return etherealTransporter;
  try {
    console.log("SMTP not configured - creating Ethereal test account for email preview...");
    etherealAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    });
    console.log(`Ethereal test account created: ${etherealAccount.user}`);
    console.log(`Preview emails at: https://ethereal.email/login (user: ${etherealAccount.user})`);
    return etherealTransporter;
  } catch (e) {
    console.error("Failed to create Ethereal account:", e.message);
    return null;
  }
}

function parseFromEnv() {
  const raw = process.env.NOTIFY_EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_FROM || "no-reply@resumeai.com";
  // Support formats: "TalkSpace <email>" or "email"
  const match = raw.match(/^(.*)<(.+)>\s*$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ''), email: match[2].trim() };
  }
  return { name: "ResumeAI", email: raw.trim() };
}

async function sendEmail({ to, subject, html, text }) {
  const fromParsed = parseFromEnv();
  const from = fromParsed.email;
  const fromName = fromParsed.name || "ResumeAI";
  const transporter = createTransporter();

  // Case 1: Real SMTP configured -> use it
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${fromName}" <${from}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`[SMTP] Email sent to ${to}: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) || null };
    } catch (err) {
      console.error("[SMTP] Failed to send email:", err.message);
      // fall through to Ethereal fallback for dev so user still gets link
    }
  }

  // Case 2: No SMTP or SMTP failed -> Ethereal + direct attempt + console log
  console.warn("SMTP not fully configured or failed - using Ethereal fallback + console log");
  console.warn(`Current env: host=${process.env.SMTP_HOST} port=${process.env.SMTP_PORT} user=${process.env.SMTP_USER ? process.env.SMTP_USER.substring(0,3)+"***" : "empty"}`);

  // Try Ethereal test account
  try {
    const ethTransport = await getEtherealTransporter();
    if (ethTransport) {
      const info = await ethTransport.sendMail({
        from: `"${fromName}" <${from}>`,
        to,
        subject,
        text,
        html,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("========================================");
      console.log("ETHEREAL EMAIL (no real SMTP configured)");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Preview URL: ${previewUrl}`);
      console.log(`Ethereal login: ${etherealAccount.user} / ${etherealAccount.pass}`);
      console.log("Open preview URL to see email. For real delivery, configure SMTP in .env");
      console.log("========================================");
      return { success: true, fake: true, previewUrl, ethereal: true };
    }
  } catch (e) {
    console.error("Ethereal send failed:", e.message);
  }

  // Final fallback: console log only (dev link)
  console.log("========================================");
  console.log("FAKE EMAIL (SMTP not configured - console only)");
  console.log(`To: ${to}`);
  console.log(`From: ${from}`);
  console.log(`Subject: ${subject}`);
  console.log(`Text: ${text || html?.replace(/<[^>]*>/g, "")}`);
  console.log("========================================");
  return { success: true, fake: true };
}

function getResetEmailHtml({ name, resetUrl }) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0E9BA8 0%, #22C7D6 45%, #4F8CFF 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">ResumeAI</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">AI-powered career platform</p>
    </div>
    <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
      <h2 style="color: #0F172A; margin: 0 0 12px;">Hi ${name || "there"},</h2>
      <p style="color: #475569; line-height: 1.6;">We received a request to reset your password for your ResumeAI account.</p>
      <p style="color: #475569; line-height: 1.6;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="display:inline-block; background:#0F172A; color:#fff; text-decoration:none; padding:12px 28px; border-radius:999px; font-weight:700; font-size:14px;">Reset Password</a>
      </div>
      <p style="color:#94A3B8; font-size:13px; line-height:1.6;">If you didn’t request this, you can safely ignore this email. Your password won’t change until you use the link above.</p>
      <p style="color:#94A3B8; font-size:12px; word-break:break-all;">Or copy this link: <a href="${resetUrl}" style="color:#4F8CFF;">${resetUrl}</a></p>
    </div>
  </div>
  `;
}

function getOtpEmailHtml({ name, otp }) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0E9BA8 0%, #22C7D6 45%, #4F8CFF 100%); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #fff; margin: 0; font-size: 22px;">ResumeAI</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">AI-powered career platform</p>
    </div>
    <div style="background: #fff; border: 1px solid #E2E8F0; border-top: none; padding: 28px; border-radius: 0 0 12px 12px; text-align: center;">
      <h2 style="color: #0F172A; margin: 0 0 12px;">Hi ${name || "there"},</h2>
      <p style="color: #475569; line-height: 1.6;">Your password reset OTP is:</p>
      <div style="margin: 20px auto; background: #F8FAFC; border: 2px dashed #4F8CFF; border-radius: 12px; padding: 16px; max-width: 320px;">
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0F172A;">${otp}</div>
        <div style="font-size: 11px; color: #94A3B8; margin-top: 6px; letter-spacing: 1px; text-transform: uppercase;">Expires in 10 minutes</div>
      </div>
      <p style="color: #475569; line-height: 1.6; font-size: 13px;">Enter this OTP on the reset page to verify and set a new password. If you didn’t request this, ignore this email.</p>
      <p style="color: #94A3B8; font-size: 11px; margin-top: 16px;">For security, never share this OTP with anyone.</p>
    </div>
  </div>
  `;
}

module.exports = { sendEmail, getResetEmailHtml, getOtpEmailHtml, createTransporter };
