import type { NextFunction, Request, RequestHandler, Response } from 'express';

export function asyncHandler<T extends Request>(
  handler: (req: T, res: Response, next: NextFunction) => unknown,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve().then(() => handler(req as T, res, next)).catch(next);
  };
}
