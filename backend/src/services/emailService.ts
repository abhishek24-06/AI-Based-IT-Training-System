import nodemailer from 'nodemailer';
import { NotificationPreferences } from '../types/notification';
import { User } from '../models/User';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    attachments?: nodemailer.Attachment[]
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
        attachments,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendNotificationEmail(
    user: User,
    preferences: NotificationPreferences,
    notification: {
      type: string;
      title: string;
      message: string;
      action?: { label: string; url: string };
    }
  ): Promise<void> {
    if (!preferences.email) return;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notification.title}</h2>
        <p style="color: #666; line-height: 1.6;">${notification.message}</p>
        ${notification.action
          ? `<a href="${notification.action.url}" 
              style="display: inline-block; padding: 10px 20px; 
              background-color: #007bff; color: white; 
              text-decoration: none; border-radius: 5px; margin-top: 20px;">
              ${notification.action.label}
            </a>`
          : ''}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await this.sendEmail(user.email, notification.title, html);
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Our Platform!</h2>
        <p style="color: #666; line-height: 1.6;">
          Thank you for joining our platform. We're excited to have you on board!
        </p>
        <p style="color: #666; line-height: 1.6;">
          Your account has been successfully created. You can now log in and start exploring our courses.
        </p>
        <a href="${process.env.FRONTEND_URL}/login" 
          style="display: inline-block; padding: 10px 20px; 
          background-color: #007bff; color: white; 
          text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Log In Now
        </a>
      </div>
    `;

    await this.sendEmail(user.email, 'Welcome to Our Platform!', html);
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666; line-height: 1.6;">
          You have requested to reset your password. Click the button below to proceed.
        </p>
        <a href="${resetUrl}" 
          style="display: inline-block; padding: 10px 20px; 
          background-color: #007bff; color: white; 
          text-decoration: none; border-radius: 5px; margin-top: 20px;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail(user.email, 'Password Reset Request', html);
  }
}

export const emailService = new EmailService(); 