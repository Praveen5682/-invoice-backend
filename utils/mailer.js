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
      from: `"InvoicePro Support" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Payment Reminder: Invoice #${invoiceNo}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6C5DD3;">Payment Reminder</h2>
          <p>Hi <strong>${clientName}</strong>,</p>
          <p>This is a friendly reminder that invoice <strong>#${invoiceNo}</strong> for the amount of <strong>₹${amount}</strong> is due on <strong>${dueDate}</strong>.</p>
          <p>Please ensure that the payment is made by the due date to avoid any late fees.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">Thank you for your business!</p>
          <p style="font-size: 12px; color: #888;">InvoicePro Team</p>
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
