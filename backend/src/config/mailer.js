import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', // false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Prevents issues with self-signed certs or local proxies
    rejectUnauthorized: false
  }
});

export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log('[Mailer] SMTP Server is ready to send notifications');
  } catch (error) {
    console.warn(`[Mailer Warning] SMTP verification failed: ${error.message}`);
  }
};

export const sendBookingNotification = async (bookingData) => {
  const formattedDate = bookingData.travelDate
    ? new Date(bookingData.travelDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Not Specified';

  const customerEmailDisplay = bookingData.email
    ? `<a href="mailto:${bookingData.email}">${bookingData.email}</a>`
    : '<span style="color: #e53e3e; font-weight: bold;">Not Provided (Phone Contact Only)</span>';

  const contactAdvice = bookingData.email
    ? `You can respond directly to this email to contact <strong>${bookingData.name}</strong> (${bookingData.email}) or call <a href="tel:${bookingData.phone}">${bookingData.phone}</a>.`
    : `<strong>Note:</strong> Customer did not provide an email. Contact them directly by phone at <a href="tel:${bookingData.phone}">${bookingData.phone}</a>.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a202c; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0; font-size: 22px;">Shadow Tour Packages</h2>
        <p style="margin: 5px 0 0; font-size: 14px; color: #cbd5e0;">New Customer Tour Enquiry Received</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; width: 40%;">Reference ID:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #2b6cb0;">${bookingData.bookingReference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Customer Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;">${bookingData.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Phone Number:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;"><a href="tel:${bookingData.phone}">${bookingData.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Email Address:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;">${customerEmailDisplay}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Destination:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; text-transform: capitalize;">${bookingData.destination}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Package Category:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #2b6cb0; font-weight: 600;">${bookingData.category || 'Standard Package'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Travellers:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;">${bookingData.travellers}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Travel Date:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7;">${formattedDate}</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #4a5568;">${contactAdvice}</p>
      </div>
    </div>
  `;

  const textFallback = `
New Tour Enquiry Received - Shadow Tour Packages
------------------------------------------------
Reference ID: ${bookingData.bookingReference}
Customer Name: ${bookingData.name}
Phone: ${bookingData.phone}
Email: ${bookingData.email || 'Not Provided'}
Destination: ${bookingData.destination}
Category: ${bookingData.category || 'Standard Package'}
Travellers: ${bookingData.travellers}
Travel Date: ${formattedDate}
  `.trim();

  const mailOptions = {
    from: `"Shadow Tours Website" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `New Tour Enquiry - ${bookingData.destination.toUpperCase()} (${bookingData.bookingReference})`,
    text: textFallback,
    html: htmlContent
  };

  // Only attach replyTo if the customer actually provided an email
  if (bookingData.email) {
    mailOptions.replyTo = bookingData.email;
  }

  return await transporter.sendMail(mailOptions);
};