import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/index.js';

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin';
}

export interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET as jwt.Secret, {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, env.JWT_SECRET as string) as JWTPayload;
    } catch {
        return null;
    }
}

export function optionalAuth(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }

    next();
}

export function requireAuth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required', type: 'auth_error' });
        return;
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token', type: 'auth_error' });
        return;
    }

    req.user = payload;
    next();
}

export function requireAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required', type: 'auth_error' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required', type: 'auth_error' });
        return;
    }

    next();
}
