/**
 * Runtime aniqlash: Node (Render/local) yoki Cloudflare Workers.
 *
 * Workers'da `navigator.userAgent` aynan "Cloudflare-Workers" bo'ladi.
 * Bu bayroq orqali fayl tizimi, timer va boshqa Node-only amallarni
 * shartli ravishda o'chiramiz — kod ikkala muhitda ham ishlaydi.
 */
const runtimeNavigator = (globalThis as { navigator?: { userAgent?: string } }).navigator;

export const isWorkersRuntime = runtimeNavigator?.userAgent === 'Cloudflare-Workers';
