import colors from 'colors';
import nodemailer from 'nodemailer';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';
import config from '../config';

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: Number(config.email.smtp.port),
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
});

// Verify transporter connection
if (config.env !== 'test') {
  transporter
    .verify()
    .then(() => logger.info(colors.cyan('📧  Connected to email server')))
    .catch(err =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

// Function to send email
const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `"${config.email.from}"`, // sender address
      to: values.to, // list of receivers
      subject: values.subject, // subject line
      html: values.html, // html body
    });
    logger.info('Mail sent successfully', info.accepted);
  } catch (error) {
    errorLogger.error('Email', error);
  }
};

// Generate email body
const generateEmailBody = (otp: string, type: string) => {
  const title = type === 'Password Reset' ? 'Password Reset Code' : 'Welcome to Qeyys';
  const introText =
    type === 'Password Reset'
      ? 'We received a request to reset your password. Use the code below to reset your password.'
      : 'Thank you for joining Qeyys! Your account is almost ready. Use the code below to verify your account.';
  return `
    <body style="background-color: #f3f4f6; font-family: 'Arial', sans-serif; color: #333; margin: 0; padding: 0;">
      <div style="width: 80%; margin:0 auto; padding: 1rem; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); text-align: center;">
          <!-- Logo -->
          <img src="https://i.postimg.cc/SsVJt2ys/locksimt.gif" alt="Qeyys Logo" style="max-width: 120px; margin-bottom: 20px; border-radius: 10px;">

          <!-- Header -->
          <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937; font-family: 'Helvetica Neue', sans-serif;">${title}</h1>

          <!-- Introductory Text -->
          <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1rem; line-height: 1.5;">${introText}</p>

          <!-- OTP Code Box -->
          <div style="width: 50%; margin: 0 auto; background-color: #DB2424; color: #ffffff; padding: 0.5rem ; border-radius: 0.5rem; text-align: center;">
           <p style="font-size: 2rem; font-weight: 800; letter-spacing: 0.1rem; margin-bottom: 1.5rem; text-transform: uppercase;">${otp}</p>
          </div>

          <!-- Verification Instructions -->
          <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1rem;">Enter this code to verify your account.</p>

          <!-- Footer Text -->
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1.5rem;">If you did not request this verification, please ignore this email.</p>
          <p style="color: #6b7280; font-size: 0.875rem;">Thanks, The Qeyys Team</p>

          <!-- Expiry Information -->
          <p style="color: #ff0000; font-size: 0.85rem; margin-top: 1.5rem;">This code expires in <span id="timer">3:00</span> minutes.</p>

        </div>
      </div>
    </body>
  `;
};

const generateEmailBodyForInvitation = (email: string, password: string, role: string, type: string) => {
  const title = 'You are Invited to Join Qeyys!';
  const introText =
    'We are excited to invite you to join Qeyys! Your account has been created, and we’ve set up your credentials for you. Please use the details below to log in to your account.';

  return `
    <body style="background-color: #f3f4f6; font-family: 'Arial', sans-serif; color: #333; margin: 0; padding: 0;">
      <div style="width: 80%; margin:0 auto; padding: 1rem; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1); text-align: center;">
          <!-- Logo -->
          <img src="https://i.postimg.cc/SsVJt2ys/locksimt.gif" alt="Qeyys Logo" style="max-width: 120px; margin-bottom: 20px; border-radius: 10px;">

          <!-- Header -->
          <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem; color: #1f2937; font-family: 'Helvetica Neue', sans-serif;">${title}</h1>

          <!-- Introductory Text -->
          <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1rem; line-height: 1.5;">${introText}</p>

          <!-- Invitation Credentials -->
          <div style="background-color: #F3F4F6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; text-align: left;">
            <p style="color: #333; font-size: 1rem; margin: 0;"><strong>Email:</strong> ${email}</p>
            <p style="color: #333; font-size: 1rem; margin: 0;"><strong>Password:</strong> ${password}</p>
            <p style="color: #333; font-size: 1rem; margin: 0;"><strong>Role:</strong> ${role}</p>
          </div>

          <!-- Login Instructions -->
          <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1rem;">Use the credentials above to log in and complete your profile on Qeyys. We look forward to having you with us!</p>

          <!-- Footer Text -->
          <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1.5rem;">If you did not request this invitation, please ignore this email.</p>
          <p style="color: #6b7280; font-size: 0.875rem;">Thanks, The Qeyys Team</p>

        </div>
      </div>
    </body>
  `;
};


// Function to send email verification
const sendEmailVerification = async (to: string, otp: string) => {
  const subject = ' Account Verification Code : ';
  const html = generateEmailBody(otp, 'Account Verification');
  await sendEmail({ to, subject, html });
};
// Function to send email verification
const sendEmailInvitation = async (to: string, password: string, role : string) => {
  const subject = ' We Invite You In Our System ';
  const html = generateEmailBodyForInvitation(to ,password, role, 'Invitation');
  await sendEmail({ to, subject, html });
};

// Function to send reset password email
const sendResetPasswordEmail = async (to: string, otp: string) => {
  const subject = ' Password Reset Code : ';
  const html = generateEmailBody(otp, 'Password Reset');
  await sendEmail({ to, subject, html });
};

export { sendEmailVerification, sendResetPasswordEmail, sendEmailInvitation};
