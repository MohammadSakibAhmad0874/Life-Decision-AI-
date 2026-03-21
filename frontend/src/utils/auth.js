/**
 * Auth token utilities — localStorage helpers.
 */

const TOKEN_KEY = "lda_token";
const USER_KEY  = "lda_user";

export function saveToken(token)  { localStorage.setItem(TOKEN_KEY, token); }
export function getToken()        { return localStorage.getItem(TOKEN_KEY); }
export function clearToken()      { localStorage.removeItem(TOKEN_KEY); }

export function saveUser(user)    { localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function getSavedUser()    {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}
export function clearUser()       { localStorage.removeItem(USER_KEY); }

export function clearAuth()       { clearToken(); clearUser(); }

/** Parse JWT payload (no signature verification — done server-side). */
export function parseToken(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const p = parseToken(token);
  if (!p?.exp) return true;
  return Date.now() / 1000 > p.exp;
}
