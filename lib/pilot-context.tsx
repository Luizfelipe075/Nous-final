"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import type {
  CheckinSettings,
  ClinicalNote,
  CompletionInput,
  ConsentState,
  DiaryEntry,
  PatientInvite,
  PilotView,
  TaskStatus,
  TherapeuticTask,
} from "@/lib/pilot-types"

export type {
  CheckinSettings,
  ClinicalNote,
  CompletionInput,
  ConsentState,
  DiaryEntry,
  DiaryVisibility,
  NoteKind,
  PatientInvite,
  TaskStatus,
  TherapeuticTask,
} from "@/lib/pilot-types"

const emptyConsent: ConsentState = {
  accepted: false,
  shareCheckins: false,
  shareDiaryByChoice: false,
}

const emptyView: PilotView = {
  patients: [],
  checkins: [],
  tasks: [],
  diary: [],
  notes: [],
  settings: {},
  invites: [],
  audit: [],
  consent: emptyConsent,
  twoFactorEnabled: false,
}

interface PilotContextValue extends PilotView {
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addTask: (task: Omit<TherapeuticTask, "id" | "createdAt" | "status" | "version" | "completion" | "review">) => Promise<void>
  updateTask: (id: string, patch: Partial<Pick<TherapeuticTask, "patientId" | "title" | "description" | "dueDate" | "status">>) => Promise<void>
  setTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  reportTaskCompletion: (id: string, completion: CompletionInput) => Promise<void>
  reviewTask: (id: string) => Promise<void>
  addDiaryEntry: (entry: Omit<DiaryEntry, "id" | "date" | "patientId">) => Promise<void>
  addClinicalNote: (note: Omit<ClinicalNote, "id" | "createdAt">) => Promise<void>
  updateCheckinSettings: (patientId: string, patch: Partial<CheckinSettings>) => Promise<void>
  createInvite: (name: string, email: string) => Promise<void>
  refreshInvite: (id: string) => Promise<void>
  updateConsent: (patch: Partial<ConsentState>) => Promise<void>
  setTwoFactorEnabled: (enabled: boolean) => Promise<void>
  addAuditEvent: (action: string, detail: string) => Promise<void>
  archivePatient: (id: string) => Promise<void>
  addCheckin: (entry: Record<string, unknown>) => Promise<void>
  exportPatientData: (patientId: string) => void
}

const PilotContext = createContext<PilotContextValue | undefined>(undefined)

export function PilotProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<PilotView>(emptyView)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setState(emptyView)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/pilot", { cache: "no-store" })
      const data = await response.json() as { state?: PilotView; error?: string }
      if (!response.ok || !data.state) throw new Error(data.error || "Não foi possível carregar os dados.")
      setState(data.state)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) void refresh()
  }, [authLoading, refresh])

  const request = useCallback(async (action: string, payload?: unknown) => {
    setError(null)
    try {
      const response = await fetch("/api/pilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, payload }),
      })
      const data = await response.json() as { state?: PilotView; error?: string }
      if (!response.ok || !data.state) throw new Error(data.error || "Não foi possível concluir a operação.")
      setState(data.state)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a operação.")
    }
  }, [])

  const value = useMemo<PilotContextValue>(() => ({
    ...state,
    loading,
    error,
    refresh,
    addTask: async (task) => request("add-task", task),
    updateTask: async (id, patch) => request("update-task", { id, ...patch }),
    setTaskStatus: async (id, status) => request("set-task-status", { id, status }),
    reportTaskCompletion: async (id, completion) => request("report-task-completion", { id, ...completion }),
    reviewTask: async (id) => request("review-task", { id }),
    addDiaryEntry: async (entry) => request("add-diary", entry),
    addClinicalNote: async (note) => request("add-note", note),
    updateCheckinSettings: async (patientId, patch) => request("update-settings", { patientId, ...patch }),
    createInvite: async (name, email) => request("create-invite", { name, email }),
    refreshInvite: async (id) => request("refresh-invite", { id }),
    updateConsent: async (patch) => request("update-consent", patch),
    setTwoFactorEnabled: async (enabled) => request("set-two-factor", { enabled }),
    addAuditEvent: async (action, detail) => request("add-audit", { action, detail }),
    archivePatient: async (id) => request("archive-patient", { id }),
    addCheckin: async (entry) => request("add-checkin", entry),
    exportPatientData: (patientId) => {
      const payload = {
        generatedAt: new Date().toISOString(),
        patientId,
        checkinSettings: state.settings[patientId],
        checkins: state.checkins.filter((item) => item.patientId === patientId),
        tasks: state.tasks.filter((item) => item.patientId === patientId),
        diary: state.diary.filter((item) => item.patientId === patientId),
        notes: state.notes.filter((item) => item.patientId === patientId && item.kind === "prontuario"),
        consent: state.consent,
      }
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }))
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `nous-dados-${patientId}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      void request("add-audit", { action: "Dados exportados", detail: `Arquivo de portabilidade gerado para ${patientId}` })
    },
  }), [state, loading, error, refresh, request])

  return <PilotContext.Provider value={value}>{children}</PilotContext.Provider>
}

export function usePilot() {
  const context = useContext(PilotContext)
  if (!context) throw new Error("usePilot must be used within PilotProvider")
  return context
}

export function getDefaultCheckinSettings(patientId: string): CheckinSettings {
  return {
    patientId,
    enabled: { mood: true, energy: true, sleep: true, anxiety: true },
    frequency: "diario",
  }
}
