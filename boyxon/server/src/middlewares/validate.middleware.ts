import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError';

type Schemas = { body?: z.ZodSchema; query?: z.ZodSchema; params?: z.ZodSchema };

/** Zod validatsiya middleware — xato bo'lsa 400 qaytaradi. */
export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      next();
    } catch (e) {
      if (e instanceof z.ZodError) {
        const msg = e.errors.map((x) => `${x.path.join('.')}: ${x.message}`).join('; ');
        throw ApiError.badRequest(msg);
      }
      throw e;
    }
  };
}
