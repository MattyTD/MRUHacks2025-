const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendVerificationEmail(user, origin) {
  const token = uuidv4();
  user.verificationToken = token;
  await user.save();

  // Ensure the link points to the backend API route, not the frontend
  const verifyUrl = `http:/localhost:5001/api/auth/verify-email/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Hey ${user.name},</p><p>Please verify your email by clicking <a href="${verifyUrl}">here!</a>.</p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
