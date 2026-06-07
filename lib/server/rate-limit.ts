/**
 * In-memory login rate limiter.
 *
 * Tracks failed login attempts by a composite key (username + IP).
 * After exceeding the threshold within the configured window, further
 * attempts are blocked until the window expires.
 *
 * This is a single-process in-memory implementation suitable for the
 * current application-internal deployment model. For multi-instance
 * deployments, replace with Redis or a shared store.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

type Entry = {
  count: number;
  firstAttemptAt: number;
};

const store = new Map<string, Entry>();

function buildKey(username: string, ip: string) {
  return `${username}::${ip}`;
}

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.firstAttemptAt > WINDOW_MS) {
      store.delete(key);
    }
  }
}

export function recordFailedAttempt(username: string, ip: string) {
  cleanupExpired();
  const key = buildKey(username, ip);
  const existing = store.get(key);

  if (existing) {
    existing.count += 1;
  } else {
    store.set(key, { count: 1, firstAttemptAt: Date.now() });
  }
}

export function isRateLimited(username: string, ip: string) {
  cleanupExpired();
  const key = buildKey(username, ip);
  const entry = store.get(key);

  if (!entry) {
    return false;
  }

  return entry.count >= MAX_ATTEMPTS;
}

export function clearAttempts(username: string, ip: string) {
  store.delete(buildKey(username, ip));
}

export function getRemainingLockoutMs(username: string, ip: string) {
  const key = buildKey(username, ip);
  const entry = store.get(key);

  if (!entry || entry.count < MAX_ATTEMPTS) {
    return 0;
  }

  const elapsed = Date.now() - entry.firstAttemptAt;
  return Math.max(0, WINDOW_MS - elapsed);
}
