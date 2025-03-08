import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export interface JWTPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const signToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Error signing JWT:', error);
    throw new Error('Failed to generate authentication token');
  }
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    if (!token) {
      console.error('No token provided');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (typeof decoded !== 'object' || !decoded.id || !decoded.email) {
      console.error('Invalid token payload');
      return null;
    }

    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT verification error:', error.message);
    } else {
      console.error('Unexpected error during token verification:', error);
    }
    return null;
  }
}; 