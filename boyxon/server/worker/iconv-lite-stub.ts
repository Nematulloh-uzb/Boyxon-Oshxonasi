/**
 * `iconv-lite` o'rniga minimal stub.
 *
 * Express 4 o'z ichida `body-parser`ni yuklaydi, u esa `iconv-lite`ni yuklaydi.
 * `iconv-lite` Node stream'lariga tayanadi va Workers runtime'da modul yuklanishida
 * yiqiladi (`require_streams is not a function`). API faqat UTF-8 JSON qabul qiladi,
 * shuning uchun to'liq kodlash kutubxonasi shart emas.
 */
import { Buffer } from 'node:buffer';

export function encodingExists(encoding: string): boolean {
  return /^(utf-?8|utf8|ascii|us-ascii|latin1|binary)$/i.test(String(encoding));
}

export function decode(buffer: Buffer | Uint8Array, encoding = 'utf-8'): string {
  return Buffer.from(buffer).toString(encoding as BufferEncoding);
}

export function encode(text: string, encoding = 'utf-8'): Buffer {
  return Buffer.from(text, encoding as BufferEncoding);
}

export function getDecoder(encoding: string) {
  return {
    write: (buffer: Buffer | Uint8Array) => decode(buffer, encoding),
    end: () => '',
  };
}

export function getEncoder(encoding: string) {
  return {
    write: (text: string) => encode(text, encoding),
    end: () => Buffer.alloc(0),
  };
}

export default { encodingExists, decode, encode, getDecoder, getEncoder };
