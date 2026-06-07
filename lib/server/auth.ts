import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "fip_operator_session";

function getAuthConfig() {
  return {
    username: process.env.OPERATOR_USERNAME ?? "operator",
    password: process.env.OPERATOR_PASSWORD ?? "change-me",
    secret: process.env.AUTH_SECRET ?? "local-dev-secret"
  };
}

function signSessionValue(username: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(username).digest("hex");
}

export function verifyOperatorCredentials(username: string, password: string) {
  const config = getAuthConfig();
  return username === config.username && password === config.password;
}

export async function createOperatorSession(username: string) {
  const config = getAuthConfig();
  const cookieStore = await cookies();
  const signature = signSessionValue(username, config.secret);

  cookieStore.set(SESSION_COOKIE, `${username}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearOperatorSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getOperatorSessionActor() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return null;
  }

  const [username] = cookieValue.split(".");
  return username ?? null;
}

export async function hasOperatorSession() {
  const config = getAuthConfig();
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;

  if (!cookieValue) {
    return false;
  }

  const [username, signature] = cookieValue.split(".");
  if (!username || !signature) {
    return false;
  }

  return signature === signSessionValue(username, config.secret) && username === config.username;
}

export async function requireOperatorSession() {
  const authenticated = await hasOperatorSession();
  if (!authenticated) {
    redirect("/login?next=/operator");
  }
}
