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

  const verifyUrl = `${origin}/api/auth/verify-email/${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Verify your email',
    html: `<p>Hi ${user.name},</p><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
