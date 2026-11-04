import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} não definido`);
  }

  return value;
}

export function getMailer(): Transporter {
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465;

  transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port,
    secure,
    auth: {
      user: requireEnv('SMTP_USER'),
      pass: requireEnv('SMTP_PASS'),
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  return transporter;
}

export function getMailFrom(): string {
  return process.env.MAIL_FROM ?? `Cadê? <${requireEnv('SMTP_USER')}>`;
}