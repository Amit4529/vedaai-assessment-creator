import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formatted = (result.error as ZodError).issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json({ success: false, errors: formatted });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
