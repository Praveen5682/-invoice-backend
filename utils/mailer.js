const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: process.env.MAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports.sendOtpEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"InvoicePro Support" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding:40px 0;">
                
                <table width="400" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:#6C5DD3; padding:20px; text-align:center; color:#ffffff;">
                      <h2 style="margin:0;">InvoicePro</h2>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:30px; text-align:center; color:#333;">
                      <h3 style="margin-bottom:10px;">Verify Your Email</h3>
                      <p style="font-size:14px; color:#666;">
                        Use the OTP below to complete your verification
                      </p>

                      <!-- OTP Box -->
                      <div style="margin:25px 0; padding:15px; background:#f4f6ff; border-radius:8px; display:inline-block;">
                        <span style="font-size:28px; letter-spacing:6px; font-weight:bold; color:#6C5DD3;">
                          ${otp}
                        </span>
                      </div>

                      <p style="font-size:13px; color:#999;">
                        This OTP is valid for 10 minutes.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:15px; text-align:center; font-size:12px; color:#aaa; border-top:1px solid #eee;">
                      If you didn’t request this, you can safely ignore this email.
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>
        </div>
      `,
    });

    console.log("OTP Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("OTP Email Error:", error);
    return false;
  }
};
module.exports.sendReminderEmail = async (
  clientEmail,
  clientName,
  invoiceNo,
  amount,
  dueDate,
) => {
  try {
    const info = await transporter.sendMail({
      from: `"InvoicePro Support" <${process.env.MAIL_USER}>`,
      to: clientEmail,
      subject: `Payment Reminder: Invoice #${invoiceNo}`,
      html: `
        <div style="margin:0; padding:0; background-color:#f8fafc; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding:40px 0;">
                <table width="550" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden; border:1px solid #e2e8f0;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:#2563eb; padding:30px; text-align:center;">
                      <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; letter-spacing:-0.5px;">InvoicePro</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px; color:#1e293b;">
                      <h2 style="margin:0 0 20px; font-size:20px; font-weight:700; color:#0f172a;">Payment Reminder</h2>
                      <p style="font-size:16px; line-height:1.6; color:#475569; margin-bottom:25px;">
                        Hi <strong>${clientName}</strong>,
                      </p>
                      <p style="font-size:15px; line-height:1.6; color:#475569; margin-bottom:30px;">
                        This is a friendly follow-up regarding your outstanding balance for invoice <strong>#${invoiceNo}</strong>.
                      </p>

                      <!-- Summary Box -->
                      <div style="background:#f1f5f9; border-radius:12px; padding:25px; margin-bottom:35px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-bottom:10px; font-size:14px; color:#64748b;">Amount Due</td>
                            <td align="right" style="padding-bottom:10px; font-size:18px; font-weight:700; color:#0f172a;">₹${Number(amount).toLocaleString("en-IN")}</td>
                          </tr>
                          <tr>
                            <td style="font-size:14px; color:#64748b;">Due Date</td>
                            <td align="right" style="font-size:15px; font-weight:600; color:#dc2626;">${new Date(dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                          </tr>
                        </table>
                      </div>

                      <p style="font-size:14px; line-height:1.6; color:#64748b; margin-bottom:35px; text-align:center;">
                        Please ensure the payment is completed by the due date to keep your account in good standing.
                      </p>

                      <!-- Action Button -->
                      <div style="text-align:center;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/invoices" style="display:inline-block; background:#2563eb; color:#ffffff; padding:16px 32px; border-radius:12px; font-weight:700; text-decoration:none; font-size:15px; transition:all 0.3s ease;">
                          View Invoice & Pay
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:30px; text-align:center; background:#f8fafc; border-top:1px solid #e2e8f0;">
                      <p style="margin:0; font-size:13px; color:#94a3b8;">Thank you for your business!</p>
                      <p style="margin:8px 0 0; font-size:12px; color:#cbd5e1;">© 2026 InvoicePro. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
