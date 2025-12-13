import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { getSigningKeyId } from '../security/jwks';

// Normalize keys (handle escaped newlines from env vars)
const PRIVATE_KEY = config.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
export const PUBLIC_KEY = config.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');

export interface BasePayload {
  sub: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface AccessTokenPayload extends BasePayload {
  type: 'access';
  tenantId: string;
  role: string;
  plan: string;
  features?: string[];
}

export interface RefreshTokenPayload extends BasePayload {
  type: 'refresh';
  tenantId: string;
}

export interface ActivationTokenPayload extends BasePayload {
  type: 'activation';
}

export type TokenPayload = AccessTokenPayload | RefreshTokenPayload | ActivationTokenPayload;

export const signAccessToken = (payload: Omit<AccessTokenPayload, 'type' | 'exp' | 'iat' | 'iss' | 'aud'>) => {
  return jwt.sign({ ...payload, type: 'access' }, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: `${config.JWT_ACCESS_TTL_MIN}m`,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
    keyid: getSigningKeyId(), // Critical for JWKS verification
  });
};

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, 'type' | 'exp' | 'iat' | 'iss' | 'aud' | 'features' | 'role' | 'plan'>) => {
  // Refresh tokens contain minimal claims
  return jwt.sign({ ...payload, type: 'refresh' }, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: `${config.JWT_REFRESH_TTL_DAYS}d`,
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
    keyid: getSigningKeyId(),
  });
};

export const signActivationToken = (payload: { sub: string }) => {
  return jwt.sign({ ...payload, type: 'activation' }, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '24h',
    issuer: config.JWT_ISSUER,
    audience: config.JWT_AUDIENCE,
    keyid: getSigningKeyId(),
  });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE,
    }) as TokenPayload;
  } catch (err) {
    throw new Error('Invalid token');
  }
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateApiKey = () => {
  const prefix = 'sk_live_';
  const secret = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}${secret}`;
  return { key, prefix, hash: hashToken(key) };
};