import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import type { User, UserRole } from "@/lib/store"

export const AUTH_COOKIE = "nous_session"

const demoAccounts: Record<UserRole, { user: User; email: string; password: string }> = {
  paciente: {
    user: { id: "p1", name: "Ana Beatriz Silva", email: "paciente@demo.nous", role: "paciente" },
    email: process.env.NOUS_PATIENT_EMAIL || "paciente@demo.nous",
    password: process.env.NOUS_PATIENT_PASSWORD || "NousPaciente2026!",
  },
  psicologo: {
    user: { id: "psy1", name: "Dra. Maria Oliveira", email: "psicologo@demo.nous", role: "psicologo" },
    email: process.env.NOUS_PSYCHOLOGIST_EMAIL || "psicologo@demo.nous",
    password: process.env.NOUS_PSYCHOLOGIST_PASSWORD || "NousPsicologo2026!",
  },
}

const sessionSecret = process.env.NOUS_SESSION_SECRET || "development-only-nous-session-secret"

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url")
}

export function authenticateDemoAccount(email: string, password: string, role: UserRole) {
  const account = demoAccounts[role]
  if (!safeEqual(email.trim().toLowerCase(), account.email.toLowerCase())) return null
  if (!safeEqual(password, account.password)) return null
  return account.user
}

export function createSessionToken(user: User) {
  const payload = Buffer.from(JSON.stringify({ user, expiresAt: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url")
  return `${payload}.${signature(payload)}`
}

export function readSessionToken(token?: string | null): User | null {
  if (!token) return null
  const [payload, providedSignature] = token.split(".")
  if (!payload || !providedSignature || !safeEqual(providedSignature, signature(payload))) return null

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user: User; expiresAt: number }
    if (parsed.expiresAt < Date.now()) return null
    if (!parsed.user || !["paciente", "psicologo"].includes(parsed.user.role)) return null
    return parsed.user
  } catch {
    return null
  }
}

export function readUserFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") || ""
  const token = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE}=`))
    ?.slice(AUTH_COOKIE.length + 1)
  return readSessionToken(token)
}

export function getDemoCredentials(role: UserRole) {
  const account = demoAccounts[role]
  return { email: account.email, password: account.password }
}

