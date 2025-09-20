import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../../shared/types';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: 'farmer' | 'carrier';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Access token required'
    };
    return res.status(401).json(response);
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Invalid or expired token'
      };
      return res.status(403).json(response);
    }

    req.user = decoded as any;
    next();
  });
};

export const requireUserType = (userType: 'farmer' | 'carrier') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Authentication required'
      };
      return res.status(401).json(response);
    }

    if (req.user.userType !== userType) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Access denied. ${userType} role required.`
      };
      return res.status(403).json(response);
    }

    next();
  };
};

export const generateToken = (payload: { userId: string; email: string; userType: 'farmer' | 'carrier' }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};