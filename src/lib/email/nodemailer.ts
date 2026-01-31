// lib/services/email-service.ts
import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmailChangeCode(
    to: string,
    userName: string,
    code: string,
    newEmail?: string,
  ): Promise<boolean> {
    try {
      const subject = newEmail
        ? `Confirmação de alteração de email - Minhas Contas`
        : `Seu código de verificação - Minhas Contas`;

      const action = newEmail
        ? `alterar seu email para <strong>${newEmail}</strong>`
        : `realizar uma ação na sua conta`;

      const mailOptions = {
        from: `"Minhas Contas" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Olá ${userName}!</h2>
            <p>Você solicitou um código de verificação para ${action}.</p>
            <p>Seu código de verificação é:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; margin: 25px 0; border-radius: 10px;">
              <h1 style="margin: 0; letter-spacing: 10px; color: white; font-size: 42px; font-weight: bold;">${code}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              <strong>Atenção:</strong> Este código expira em 15 minutos.
            </p>
            <p>Se você não solicitou este código, por favor ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #666; font-size: 12px; text-align: center;">
              Minhas Contas - © ${new Date().getFullYear()}
            </p>
          </div>
        `,
        text: `Olá ${userName}! Seu código de verificação é: ${code} - Expira em 15 minutos.`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado para: ${to} - ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error("❌ Erro ao enviar email:", error);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log("✅ Conexão com servidor de email OK");
    } catch (error) {
      console.error("❌ Falha na conexão com email:", error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
