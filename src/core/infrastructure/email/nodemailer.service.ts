/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // ejemplo: 'smtp.gmail.com'
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: options.from || `"NEXTEST" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      this.logger.error(`Error trying to send email: ${error.message}`);
      throw error;
    }
  }
}
