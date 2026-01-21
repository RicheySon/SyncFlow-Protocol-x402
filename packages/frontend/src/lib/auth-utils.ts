import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'syncflow-secret-key-change-me';

export interface DecodedToken {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

export function signToken(payload: { userId: string; email: string; role: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): DecodedToken | null {
    try {
        return jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (error) {
        return null;
    }
}

export function getUserIdFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    return decoded ? decoded.userId : null;
}
