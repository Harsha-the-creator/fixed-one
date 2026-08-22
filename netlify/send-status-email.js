const nodemailer = require('nodemailer');

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { email, studentName, applicationId, status } = JSON.parse(event.body || '{}');
  const allowedStatuses = ['approved', 'rejected', 'pending'];
  if (!email || !studentName || !applicationId || !allowedStatuses.includes(status)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Incomplete status email details' }) };
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Email service is not configured' }) };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'not approved' : 'returned to pending review';

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Application ${applicationId} status update`,
      text: `Dear Parent/Guardian,\n\nThe application for ${studentName} (ID: ${applicationId}) has been ${statusText}.\n\nPlease contact the admissions office for further details.\n\nGAYATRI JUNIOR & DEGREE COLLEGE`
    });
    return { statusCode: 200, body: JSON.stringify({ sent: true }) };
  } catch (error) {
    console.error('Status email failed:', error);
    return { statusCode: 502, body: JSON.stringify({ error: 'Unable to send status email' }) };
  }
};
