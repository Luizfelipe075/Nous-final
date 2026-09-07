"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { User, UserRole } from "@/lib/store"

interface LoginResult {
  ok: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<LoginResult>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user?: User | null }) => { if (active) setUser(data.user || null) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const login = useCallback(async (email: string, password: string, role: UserRole): Promise<LoginResult> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await response.json() as { user?: User; error?: string }
      if (!response.ok || !data.user) return { ok: false, error: data.error || "Não foi possível entrar." }
      setUser(data.user)
      return { ok: true }
    } catch {
      return { ok: false, error: "O serviço de autenticação está indisponível." }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user),
  }), [user, loading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

