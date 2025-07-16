/**
 * JWT token utility functions
 * Allows decoding and extracting data from JWT tokens stored in localStorage
 */

/**
 * Parse a JWT token without external dependencies
 * @param {string} token - JWT token string to decode
 * @returns {object|null} Decoded payload or null if invalid
 */
export function parseJwt(token) {
  try {
    // JWT structure is: header.payload.signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Convert base64url to regular base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64 string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

/**
 * Get the username from the JWT token in localStorage
 * @param {string} tokenKey - Key used to store the token in localStorage (default: 'token')
 * @returns {string|null} Username from token or null if not found/invalid
 */
export function getUsernameFromToken(tokenKey = 'token') {
  try {
    const token = localStorage.getItem(tokenKey);
    if (!token) return null;
    
    const decoded = parseJwt(token);
    if (!decoded) return null;
    
    // The username field in the JWT payload might be called different things
    // Adjust these according to your actual token structure
    return decoded.username || decoded.user_id || decoded.sub || null;
  } catch (e) {
    console.error('Error getting username from token:', e);
    return null;
  }
}

/**
 * Check if the current token is valid (not expired)
 * @param {string} tokenKey - Key used to store the token in localStorage (default: 'token')
 * @returns {boolean} True if token exists and is not expired
 */
export function isTokenValid(tokenKey = 'token') {
  try {
    const token = localStorage.getItem(tokenKey);
    if (!token) return false;
    
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return false;
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (e) {
    console.error('Error validating token:', e);
    return false;
  }
}

export default {
  parseJwt,
  getUsernameFromToken,
  isTokenValid
};