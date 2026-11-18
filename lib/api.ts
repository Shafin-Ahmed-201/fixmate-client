/**
 * Typed fetch layer for the FixMate API.
 *
 * Auth: BetterAuth hosts the session cookie; the Express API expects a JWT
 * (fetched from GET /api/auth/token). Tokens are cached in memory until
 * shortly before expiry.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface CachedToken {
  token: string;
  exp: number;
}

let tokenCache: CachedToken | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/** Decodes a JWT payload without verifying (verification happens server-side). */
function decodeToken(token: string): { exp?: number } | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function invalidateToken() {
  tokenCache = null;
}

/** Returns a fresh BetterAuth JWT, or null when signed out. */
export async function getJwt(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && tokenCache.exp > now + 30) return tokenCache.token;

  try {
    const res = await fetch(`${window.location.origin}/api/auth/token`, {
      credentials: "include",
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { token?: string };
    if (!data.token) return null;

    tokenCache = { token: data.token, exp: decodeToken(data.token)?.exp ?? now + 60 };
    return data.token;
  } catch {
    return null;
  }
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Attach the JWT (default true). */
  auth?: boolean;
  query?: Record<string, string | number | undefined | null>;
}

/** Calls the FixMate API and returns the parsed JSON payload. */
export async function api<T = Record<string, unknown>>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true, query } = options;

  const url = new URL(API_URL + path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = await getJwt();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the FixMate API. Is the server running?");
  }

  const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    if (res.status === 401) invalidateToken();
    throw new ApiError(res.status, (payload.message as string) || "Request failed");
  }

  return payload as T;
}

/* ----------------------------- Auth helper ----------------------------- */

/** Fetches a BetterAuth JWT directly (same-origin auth routes). */
export { getJwt as fetchAuthToken };

/** True when an error means "signed out / no permission". */
export const isAuthError = (error: unknown) =>
  error instanceof ApiError && (error.status === 401 || error.status === 403);
