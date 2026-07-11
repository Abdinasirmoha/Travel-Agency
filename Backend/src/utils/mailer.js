import nodemailer from 'nodemailer';

// Create a transporter. 
// If SMTP credentials exist in .env, it uses them to send real emails.
// If not, it falls back to a "dummy" mode for local testing.
let transporter;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // Dummy transporter for local development without credentials
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('\n--- [MOCK EMAIL DISPATCHED] ---');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Text: ${mailOptions.text}`);
      console.log('-------------------------------\n');
      console.log('Note: To send real emails, add SMTP_HOST, SMTP_USER, and SMTP_PASS to your backend .env file.');
      return { messageId: 'mock-id-' + Date.now() };
    }
  };
}

export const sendCustomerEmail = async ({ to, subject, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"EliteTravel Pro" <noreply@elitetravel.com>',
      to,
      subject,
      text,
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
