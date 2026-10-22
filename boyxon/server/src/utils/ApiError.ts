export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  /** Mashina o'qiydigan xato kodi (masalan, KITCHEN_CLOSED). */
  code?: string;
  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  static badRequest(msg = 'Noto‘g‘ri so‘rov') { return new ApiError(400, msg); }
  static unauthorized(msg = 'Avtorizatsiya talab qilinadi') { return new ApiError(401, msg); }
  static forbidden(msg = 'Ruxsat yo‘q') { return new ApiError(403, msg); }
  static notFound(msg = 'Topilmadi') { return new ApiError(404, msg); }
  static conflict(msg = 'Ziddiyat') { return new ApiError(409, msg); }
  /** Oshxona yopiq paytida yangi buyurtma qabul qilinmaydi. */
  static kitchenClosed(msg = 'Oshxona hozircha yopiq — buyurtmalar qabul qilinmaydi') {
    return new ApiError(409, msg, 'KITCHEN_CLOSED');
  }
}
