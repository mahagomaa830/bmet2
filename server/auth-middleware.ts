import { Request, Response, NextFunction } from 'express';

export function isAdmin(req: any, res: Response, next: NextFunction) {
  // Check if user is authenticated and is admin
  if (!req.user || (req.user.id !== 999 && req.user.id !== "admin")) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export function isAuthenticated(req: any, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}