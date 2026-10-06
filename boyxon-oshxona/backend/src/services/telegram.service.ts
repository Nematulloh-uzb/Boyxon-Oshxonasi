import { env } from '../config/env';

// Telegram xizmati — buyurtmalar adminga shu yerga boradi
// XATO 7 tuzatish: ilovada WebBrowser.openAuthSessionAsync() bilan login

export async function telegramXabar(matn: string): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID) {
    console.log('[Telegram]', matn);
    return;
  }
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_ADMIN_CHAT_ID, text: matn, parse_mode: 'HTML' }),
  });
}

export function buyurtmaMatni(raqam: string, jami: number, manzil: string, telefon: string): string {
  return `<b>Yangi buyurtma ${raqam}</b>\nJami: ${jami} som\nManzil: ${manzil}\nTel: ${telefon}`;
}
