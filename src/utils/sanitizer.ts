/**
 * Security & Input Sanitization Utilities
 * Protects against XSS script injection and JSON payload prototype pollution.
 */

/**
 * Strips HTML tags and unsafe script characters from user strings
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip JS protocol links
    .replace(/on\w+=/gi, '') // Strip inline JS handlers e.g. onload=
    .trim();
}

/**
 * Deeply sanitizes JSON import object to prevent Prototype Pollution (__proto__, constructor)
 */
export function sanitizeJSONObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return sanitizeString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeJSONObject(item)) as unknown as T;
  }

  const cleanObj: Record<string, unknown> = {};

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    // Prevent Prototype Pollution key injection
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    cleanObj[key] = sanitizeJSONObject((obj as Record<string, unknown>)[key]);
  }

  return cleanObj as T;
}
