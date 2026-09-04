import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Zod validation parser for requests.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Re-assign validated properties back to express request objects
      req.body = parsed.body || req.body;
      req.query = parsed.query || req.query;
      req.params = parsed.params || req.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Data validation failed',
          error: {
            code: 'VALIDATION_ERROR',
            details: error.errors.map((err) => ({
              path: err.path.slice(1).join('.') || err.path.join('.'),
              message: err.message,
            })),
          },
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: 'Internal error validating request payload',
      });
      return;
    }
  };
};
