/** Código curto do item para o canhoto: "#" + 6 últimos caracteres do id. */
export function itemCode(id: string): string {
  return `#${id.replace(/-/g, '').slice(-6).toUpperCase()}`;
}

/** Oculta parte do e-mail: maria@gmail.com → m***@gmail.com */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return `${user[0]}***@${domain}`;
}

/** Normaliza texto para busca sem acento e sem diferenciar maiúsculas. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

