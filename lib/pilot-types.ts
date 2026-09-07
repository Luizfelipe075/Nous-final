import type { MoodEntry, Patient, UserRole } from "@/lib/store"

export type TaskStatus = "pendente" | "em_andamento" | "conclusao_informada" | "revisada"
export type NoteKind = "prontuario" | "privada"
export type DiaryVisibility = "privado" | "compartilhado"

export interface TaskCompletion {
  reportedAt: string
  performedAt: string
  reflection: string
  difficulty: number
  nextSessionNote?: string
  attested: true
  reportedBy: string
  taskVersion: number
}

export interface TaskReview {
  reviewedAt: string
  reviewedBy: string
}

export interface TherapeuticTask {
  id: string
  patientId: string
  title: string
  description: string
  dueDate: string
  status: TaskStatus
  createdAt: string
  version: number
  completion?: TaskCompletion
  review?: TaskReview
}

export interface DiaryEntry {
  id: string
  patientId: string
  date: string
  emotion: string
  intensity: number
  context: string
  body: string
  strategy: string
  visibility: DiaryVisibility
}

export interface ClinicalNote {
  id: string
  patientId: string
  kind: NoteKind
  title: string
  content: string
  createdAt: string
}

export interface CheckinSettings {
  patientId: string
  enabled: { mood: boolean; energy: boolean; sleep: boolean; anxiety: boolean }
  frequency: "diario" | "3x_semana" | "semanal"
}

export interface PatientInvite {
  id: string
  name: string
  email: string
  sentAt: string
  status: "pendente" | "aceito" | "expirado"
}

export interface AuditEvent {
  id: string
  at: string
  actorId: string
  actorRole: UserRole
  action: string
  detail: string
}

export interface ConsentState {
  accepted: boolean
  shareCheckins: boolean
  shareDiaryByChoice: boolean
  acceptedAt?: string
}

export interface FullPilotState {
  schemaVersion: 3
  patients: Patient[]
  checkins: MoodEntry[]
  tasks: TherapeuticTask[]
  diary: DiaryEntry[]
  notes: ClinicalNote[]
  settings: Record<string, CheckinSettings>
  invites: PatientInvite[]
  audit: AuditEvent[]
  consents: Record<string, ConsentState>
  twoFactorEnabled: boolean
}

export interface PilotView {
  patients: Patient[]
  checkins: MoodEntry[]
  tasks: TherapeuticTask[]
  diary: DiaryEntry[]
  notes: ClinicalNote[]
  settings: Record<string, CheckinSettings>
  invites: PatientInvite[]
  audit: AuditEvent[]
  consent: ConsentState
  twoFactorEnabled: boolean
}

export interface CompletionInput {
  performedAt: string
  reflection: string
  difficulty: number
  nextSessionNote?: string
  attested: boolean
}
