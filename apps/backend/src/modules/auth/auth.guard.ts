import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
      const decoded: any = jwt.verify(token, secret);
      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
  }
}
