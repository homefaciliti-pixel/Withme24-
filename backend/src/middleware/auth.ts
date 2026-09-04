import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authorization token required',
      error: { code: 'UNAUTHORIZED' },
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_withme24_access_token_key_12345') as {
      userId: number;
      role: string;
    };

    const user = await User.findByPk(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Associated user account no longer exists',
        error: { code: 'USER_NOT_FOUND' },
      });
      return;
    }

    if (user.account_status === 'BANNED' || user.account_status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: `Your account access has been ${user.account_status.toLowerCase()}`,
        error: { code: 'ACCOUNT_LOCKED' },
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Access token is invalid or expired',
      error: { code: 'INVALID_TOKEN' },
    });
    return;
  }
};

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_withme24_access_token_key_12345') as {
      userId: number;
      role: string;
    };

    const user = await User.findByPk(payload.userId);
    if (user && user.account_status !== 'BANNED' && user.account_status !== 'SUSPENDED') {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid token for public endpoints
  }
  return next();
};
