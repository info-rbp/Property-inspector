export declare const PUBLIC_KEY: string;
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
export declare const signAccessToken: (payload: Omit<AccessTokenPayload, "type" | "exp" | "iat" | "iss" | "aud">) => string;
export declare const signRefreshToken: (payload: Omit<RefreshTokenPayload, "type" | "exp" | "iat" | "iss" | "aud" | "features" | "role" | "plan">) => string;
export declare const signActivationToken: (payload: {
    sub: string;
}) => string;
export declare const verifyToken: (token: string) => TokenPayload;
export declare const hashToken: (token: string) => string;
export declare const generateApiKey: () => {
    key: string;
    prefix: string;
    hash: string;
};
