const nodemailer = require("nodemailer");

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log(`[Email Mock/Dev] To: ${to} | Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "आर्य पाठशाला <officialaryapathshala@gmail.com>",
      to,
      subject,
      text,
      html,
    });
    console.log(`📧 Email dispatched: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email dispatch error:", error.message);
    return { success: false, error: error.message };
  }
};

const getVerificationTemplate = (name, token) => {
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}?action=verify&token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; background: #faf4e6; padding: 25px;">
      <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border-top: 5px solid #c73659;">
        <h2 style="color: #c73659; text-align: center;">आर्य पाठशाला</h2>
        <p style="font-size: 16px; color: #333;">नमस्ते <strong>${name}</strong> जी,</p>
        <p style="color: #555; line-height: 1.6;">
          आर्य पाठशाला में आपका हार्दिक स्वागत है! अपना खाता सत्यापित करने के लिए कृपया नीचे दिए गए बटन पर क्लिक करें:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: #c73659; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            खाता सत्यापित करें
          </a>
        </div>
        <p style="color: #777; font-size: 13px;">यदि आपने यह अनुरोध नहीं किया था, तो कृपया इस ईमेल को अनदेखा करें।</p>
      </div>
    </div>
  `;
};

const getResetPasswordTemplate = (name, token) => {
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}?action=reset&token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; background: #faf4e6; padding: 25px;">
      <div style="max-width: 580px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border-top: 5px solid #d4af37;">
        <h2 style="color: #c73659; text-align: center;">आर्य पाठशाला</h2>
        <p style="font-size: 16px; color: #333;">नमस्ते <strong>${name}</strong> जी,</p>
        <p style="color: #555; line-height: 1.6;">
          आपके खाते हेतु पासवर्ड रीसेट का अनुरोध प्राप्त हुआ है। नया पासवर्ड सेट करने के लिए नीचे दिए गए बटन पर क्लिक करें:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="background: #d4af37; color: #1a1a1a; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            नया पासवर्ड बनाएं
          </a>
        </div>
        <p style="color: #777; font-size: 13px;">यह लिंक 1 घंटे के लिए वैध है।</p>
      </div>
    </div>
  `;
};

module.exports = {
  sendEmail,
  getVerificationTemplate,
  getResetPasswordTemplate,
};
