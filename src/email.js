const nodemailer = require('nodemailer');

let transporter = null;

// Initialize email transporter if credentials are provided
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

async function sendEmails(meetingData) {
    if (!transporter) {
        console.log('📧 Email not configured, skipping email notifications');
        return;
    }

    try {
        const officeName = process.env.OFFICE_NAME || 'Congressional Office';
        const opsEmail = process.env.OPS_EMAIL || 'ops@office.gov';

        // Email to operations coordinator
        const opsEmail_content = {
            from: process.env.SMTP_USER,
            to: opsEmail,
            subject: `🔔 NEW MEETING REQUEST: ${meetingData.firstName} ${meetingData.lastName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
            <h1>New Meeting Request</h1>
            <p>Request ID: ${meetingData.requestId}</p>
          </div>
          
          <div style="padding: 20px;">
            <h2>Contact Information</h2>
            <p><strong>Name:</strong> ${meetingData.firstName} ${meetingData.lastName}</p>
            <p><strong>Email:</strong> ${meetingData.email}</p>
            <p><strong>Phone:</strong> ${meetingData.phone}</p>
            <p><strong>Organization:</strong> ${meetingData.organization}</p>
            <p><strong>Title:</strong> ${meetingData.title || 'Not provided'}</p>
            
            <h2>Meeting Details</h2>
            <p><strong>Purpose:</strong> ${meetingData.purpose}</p>
            <p><strong>Preferred Date:</strong> ${meetingData.preferredDate}</p>
            <p><strong>Preferred Time:</strong> ${meetingData.preferredTime}</p>
            <p><strong>Duration:</strong> ${meetingData.duration} minutes</p>
            <p><strong>Type:</strong> ${meetingData.meetingType}</p>
            <p><strong>Attendees:</strong> ${meetingData.attendees}</p>
            
            ${meetingData.accommodations ? `<p><strong>Accommodations:</strong> ${meetingData.accommodations}</p>` : ''}
            ${meetingData.additionalInfo ? `<p><strong>Additional Info:</strong> ${meetingData.additionalInfo}</p>` : ''}
          </div>
        </div>
      `
        };

        // Confirmation email to requester
        const requesterEmail = {
            from: process.env.SMTP_USER,
            to: meetingData.email,
            subject: `Meeting Request Received - ${officeName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
            <h1>${officeName}</h1>
            <p>Meeting Request Confirmation</p>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${meetingData.firstName} ${meetingData.lastName},</p>
            
            <p>Thank you for your meeting request. We have received your request and it is currently under review.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #1e3a8a; margin: 20px 0;">
              <h3>Your Request Details:</h3>
              <p><strong>Request ID:</strong> ${meetingData.requestId}</p>
              <p><strong>Organization:</strong> ${meetingData.organization}</p>
              <p><strong>Purpose:</strong> ${meetingData.purpose}</p>
              <p><strong>Requested Date:</strong> ${meetingData.preferredDate}</p>
              <p><strong>Requested Time:</strong> ${meetingData.preferredTime}</p>
            </div>
            
            <p>Our team will review your request and contact you within 1-2 business days.</p>
            
            <p>Best regards,<br>${officeName}</p>
          </div>
        </div>
      `
        };

        // Send emails
        await transporter.sendMail(opsEmail_content);
        await transporter.sendMail(requesterEmail);

        console.log(`📧 Emails sent for request ${meetingData.requestId}`);
    } catch (error) {
        console.error('Error sending emails:', error);
    }
}

module.exports = { sendEmails };
