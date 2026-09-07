"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type Screen =
  | "landing"
  | "login"
  | "tutorial"
  | "patient-dashboard"
  | "mood-diary"
  | "mood-history"
  | "meditations"
  | "emotion-wheel"
  | "psy-dashboard"
  | "psy-patients"
  | "psy-patient-detail"
  | "psy-reports"
  | "psy-report-view"
  | "psy-alphabetical"
  | "psy-follow-up"
  | "psy-settings"
  | "patient-tasks"
  | "patient-privacy"

const pathByScreen: Record<Screen, string> = {
  landing: "/",
  login: "/entrar",
  tutorial: "/paciente/tutorial",
  "patient-dashboard": "/paciente",
  "mood-diary": "/paciente/check-in",
  "mood-history": "/paciente/historico",
  meditations: "/paciente/meditacoes",
  "emotion-wheel": "/paciente/diario-emocoes",
  "patient-tasks": "/paciente/atividades",
  "patient-privacy": "/paciente/privacidade",
  "psy-dashboard": "/psicologo",
  "psy-patients": "/psicologo/pacientes",
  "psy-patient-detail": "/psicologo/paciente",
  "psy-reports": "/psicologo/relatorios",
  "psy-report-view": "/psicologo/relatorios",
  "psy-alphabetical": "/psicologo/pacientes/ordem-alfabetica",
  "psy-follow-up": "/psicologo/acompanhamento",
  "psy-settings": "/psicologo/configuracoes",
}

const screenByPath = Object.fromEntries(
  Object.entries(pathByScreen).map(([screen, path]) => [path, screen]),
) as Record<string, Screen>

interface NavigationContextType {
  screen: Screen
  navigate: (screen: Screen, params?: Record<string, string>) => void
  params: Record<string, string>
  history: Screen[]
  goBack: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

function locationState() {
  if (typeof window === "undefined") return { screen: "landing" as Screen, params: {} }
  const url = new URL(window.location.href)
  return {
    screen: screenByPath[url.pathname] || "landing",
    params: Object.fromEntries(url.searchParams.entries()),
  }
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing")
  const [params, setParams] = useState<Record<string, string>>({})
  const [history, setHistory] = useState<Screen[]>(["landing"])

  useEffect(() => {
    const sync = () => {
      const current = locationState()
      setScreen(current.screen)
      setParams(current.params)
      setHistory((previous) => previous.at(-1) === current.screen ? previous : [...previous, current.screen])
    }
    sync()
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])

  const navigate = useCallback((newScreen: Screen, newParams?: Record<string, string>) => {
    const search = new URLSearchParams(newParams || {}).toString()
    const url = `${pathByScreen[newScreen]}${search ? `?${search}` : ""}`
    window.history.pushState({ screen: newScreen }, "", url)
    setScreen(newScreen)
    setParams(newParams || {})
    setHistory((previous) => [...previous, newScreen])
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [])

  const goBack = useCallback(() => {
    if (window.history.length > 1) window.history.back()
    else navigate("landing")
  }, [navigate])

  const value = useMemo(() => ({ screen, navigate, params, history, goBack }), [screen, navigate, params, history, goBack])
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) throw new Error("useNavigation must be used within a NavigationProvider")
  return context
}

