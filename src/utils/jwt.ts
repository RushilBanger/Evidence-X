import { AuthUser, Role } from '../types';

/**
 * Safely decodes a JWT payload on the client side without verifying secret.
 */
export function decodeJwt(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64Url decode payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);

    const username = payload.sub || payload.username || 'unknown';
    const rawRole = (payload.role || 'VIEWER').toUpperCase();
    
    // Normalize role
    let role: Role = 'VIEWER';
    if (rawRole.includes('ADMIN')) {
      role = 'ADMIN';
    } else if (rawRole.includes('INVESTIGATOR')) {
      role = 'INVESTIGATOR';
    }

    return {
      username,
      role,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch (error) {
    console.error('Failed to parse JWT payload', error);
    return null;
  }
}

/**
 * Checks if token is expired based on exp claim.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}
