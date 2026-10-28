/**
 * Express ilovasini Node HTTP emulyatsiyasi orqali ishga tushirish.
 *
 * Bu modul faqat ApiServer Durable Object ichida yuklanadi — shunda MongoDB
 * ulanishi DO xotirasida saqlanib, keyingi so'rovlarda qayta ishlatiladi.
 */
import { handleAsNodeRequest } from 'cloudflare:node';

let handlerPromise: Promise<(request: Request) => Promise<Response>> | null = null;

async function build(): Promise<(request: Request) => Promise<Response>> {
  const { createApp } = await import('../src/app');
  const app = createApp();
  // Workers'da port raqami TCP port emas — Node HTTP server uchun routing kaliti.
  app.listen(3000);
  return (request: Request) => handleAsNodeRequest(3000, request);
}

export function getApiHandler(): Promise<(request: Request) => Promise<Response>> {
  if (!handlerPromise) handlerPromise = build();
  return handlerPromise;
}
