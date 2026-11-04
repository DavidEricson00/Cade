import { getMailer, getMailFrom } from '../config/mailer';

type TwoFactorEmailData = {
  to: string;
  name: string;
  code: string;
  expiresInMinutes: number;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendTwoFactorCodeEmail(data: TwoFactorEmailData) {
  const name = escapeHtml(data.name);

  const text = [
    `Olá, ${data.name}!`,
    '',
    `Seu código de verificação do Cadê? é: ${data.code}`,
    `Ele expira em ${data.expiresInMinutes} minutos e só pode ser usado uma vez.`,
    '',
    'Se você não tentou entrar no Cadê?, ignore este e-mail e considere trocar sua senha.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <h2 style="margin-bottom: 4px;">Cadê?</h2>
      <p>Olá, ${name}!</p>
      <p>Use o código abaixo para concluir seu login:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
        ${data.code}
      </p>
      <p>Ele expira em ${data.expiresInMinutes} minutos e só pode ser usado uma vez.</p>
      <p style="color: #6b7280; font-size: 13px;">
        Se você não tentou entrar no Cadê?, ignore este e-mail e considere trocar sua senha.
      </p>
    </div>
  `;

  await getMailer().sendMail({
    from: getMailFrom(),
    to: data.to,
    subject: 'Código de verificação - Cadê?',
    text,
    html,
  });
}