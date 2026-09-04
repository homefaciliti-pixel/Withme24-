import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

/**
   * Middleware to authorize specific system roles.
   */
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: { code: 'UNAUTHORIZED' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    next();
  };
};
