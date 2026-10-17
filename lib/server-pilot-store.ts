import "server-only"

import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { addDays, formatLocalDate } from "@/lib/date"
import { initialPatients, mockMoodEntries, type MoodEntry, type User } from "@/lib/store"
import type {
  CheckinSettings,
  ConsentState,
  FullPilotState,
  PilotView,
  TaskStatus,
  ScheduledSession,
} from "@/lib/pilot-types"

const isNetlifyRuntime = Boolean(process.env.SITE_ID || process.env.NETLIFY === "true")
const isServerlessRuntime = isNetlifyRuntime || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
const defaultDataDirectory = isServerlessRuntime
  ? path.join(tmpdir(), "nous-pilot")
  : path.join(process.cwd(), ".data")
const dataDirectory = process.env.NOUS_DATA_DIR?.trim() || defaultDataDirectory
const dataFile = path.join(dataDirectory, "nous-pilot-state.enc")
const temporaryDataFile = path.join(dataDirectory, "nous-pilot-state.tmp")

let warnedAboutDemoStorageSecret = false

function storageKey() {
  const configured = process.env.NOUS_DATA_SECRET?.trim()
  if (configured) return createHash("sha256").update(configured).digest()

  // O deploy acadêmico no Netlify precisa conseguir iniciar mesmo antes de o
  // segredo ser configurado no painel. Como os dados são exclusivamente
  // fictícios, usamos uma chave determinística por site apenas como fallback
  // demonstrativo. Para qualquer uso real, configure NOUS_DATA_SECRET.
  if (isNetlifyRuntime) {
    if (!warnedAboutDemoStorageSecret) {
      console.warn("NOUS_DATA_SECRET não configurado: usando chave demonstrativa do site. Configure o segredo no Netlify antes de qualquer uso real.")
      warnedAboutDemoStorageSecret = true
    }
    const siteIdentity = process.env.SITE_ID || process.env.URL || "nous-netlify-demo"
    const sessionSecret = process.env.NOUS_SESSION_SECRET || "academic-demo-session"
    return createHash("sha256").update(`netlify-demo:${siteIdentity}:${sessionSecret}`).digest()
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NOUS_DATA_SECRET must be configured in production")
  }

  return createHash("sha256").update("development-only-nous-data-secret").digest()
}

function defaultSettings(patientId: string): CheckinSettings {
  return {
    patientId,
    enabled: { mood: true, energy: true, sleep: true, anxiety: true },
    frequency: "diario",
  }
}

function defaultConsent(): ConsentState {
  return {
    accepted: true,
    shareCheckins: true,
    shareDiaryByChoice: true,
    acceptedAt: "2026-08-20T18:00:00.000Z",
  }
}

function createInitialState(): FullPilotState {
  const today = formatLocalDate()
  const settings = Object.fromEntries(initialPatients.map((patient) => [patient.id, defaultSettings(patient.id)]))
  settings.p2 = { ...settings.p2, frequency: "3x_semana" }
  const consents = Object.fromEntries(initialPatients.map((patient) => [patient.id, defaultConsent()]))

  return {
    schemaVersion: 3,
    patients: structuredClone(initialPatients),
    checkins: structuredClone(mockMoodEntries),
    tasks: [
      {
        id: "task-1",
        patientId: "p1",
        title: "Respiração diafragmática",
        description: "Praticar por cinco minutos ao perceber aceleração ou tensão.",
        dueDate: today,
        status: "em_andamento",
        createdAt: "2026-08-26T14:00:00.000Z",
        version: 1,
      },
      {
        id: "task-2",
        patientId: "p1",
        title: "Registrar uma situação-gatilho",
        description: "Anotar situação, pensamento automático e reação percebida.",
        dueDate: addDays(today, 2),
        status: "pendente",
        createdAt: "2026-08-26T14:05:00.000Z",
        version: 1,
      },
      {
        id: "task-3",
        patientId: "p1",
        title: "Pausa consciente após o almoço",
        description: "Fazer uma pausa breve sem telas e observar o corpo.",
        dueDate: addDays(today, -2),
        status: "revisada",
        createdAt: "2026-08-20T15:00:00.000Z",
        version: 1,
        completion: {
          reportedAt: "2026-08-27T17:40:00.000Z",
          performedAt: "2026-08-27T16:30:00.000Z",
          reflection: "Fiz a pausa por alguns minutos e percebi que voltei ao trabalho menos acelerada.",
          difficulty: 2,
          nextSessionNote: "Quero conversar sobre como repetir isso nos dias mais cheios.",
          attested: true,
          reportedBy: "p1",
          taskVersion: 1,
        },
        review: { reviewedAt: "2026-08-28T18:00:00.000Z", reviewedBy: "psy1" },
      },
      {
        id: "task-4",
        patientId: "p2",
        title: "Caminhada de 15 minutos",
        description: "Registrar energia antes e depois da atividade.",
        dueDate: addDays(today, 1),
        status: "pendente",
        createdAt: "2026-08-25T11:00:00.000Z",
        version: 1,
      },
    ],
    diary: [
      {
        id: "diary-1",
        patientId: "p1",
        date: "2026-08-28T20:20:00.000Z",
        emotion: "Ansiedade",
        intensity: 4,
        context: "Recebi uma demanda urgente no trabalho e achei que não conseguiria terminar.",
        body: "Respiração curta e tensão nos ombros.",
        strategy: "Fiz a respiração combinada e organizei as entregas por prioridade.",
        visibility: "compartilhado",
      },
      {
        id: "diary-2",
        patientId: "p1",
        date: "2026-08-25T21:10:00.000Z",
        emotion: "Esperança",
        intensity: 4,
        context: "Consegui conversar de forma mais clara com minha família.",
        body: "Corpo mais leve.",
        strategy: "Quero repetir a preparação antes de conversas difíceis.",
        visibility: "privado",
      },
    ],
    notes: [
      {
        id: "note-1",
        patientId: "p1",
        kind: "prontuario",
        title: "Evolução — sessão de 26/08",
        content: "Paciente relatou melhora na identificação de sinais físicos da ansiedade. Mantido plano de acompanhamento entre sessões.",
        createdAt: "2026-08-26T18:30:00.000Z",
      },
      {
        id: "note-2",
        patientId: "p1",
        kind: "privada",
        title: "Preparação da próxima sessão",
        content: "Revisar situações de sobrecarga no trabalho e adesão à técnica de respiração.",
        createdAt: "2026-08-28T12:15:00.000Z",
      },
    ],
    settings,
    sessions: [
      { id: "session-1", patientId: "p1", date: today, time: "09:30", durationMinutes: 50, note: "Sessão regular", createdAt: "2026-08-29T08:00:00.000Z", source: "planilha" },
      { id: "session-2", patientId: "p2", date: today, time: "11:00", durationMinutes: 50, note: "Sessão regular", createdAt: "2026-08-29T08:05:00.000Z", source: "planilha" },
      { id: "session-3", patientId: "p5", date: today, time: "15:30", durationMinutes: 50, note: "Sessão regular", createdAt: "2026-08-29T08:10:00.000Z", source: "planilha" },
    ],
    invites: [
      { id: "invite-1", name: "Mariana Lopes", email: "mariana@email.com", sentAt: "2026-08-28T16:20:00.000Z", status: "pendente" },
    ],
    audit: [
      { id: "audit-1", at: "2026-08-29T11:42:00.000Z", actorId: "psy1", actorRole: "psicologo", action: "Acesso ao prontuário", detail: "Dra. Maria Oliveira visualizou Ana Beatriz Silva" },
      { id: "audit-2", at: "2026-08-29T10:15:00.000Z", actorId: "psy1", actorRole: "psicologo", action: "Relatório gerado", detail: "Resumo pré-sessão de Ana Beatriz Silva" },
      { id: "audit-3", at: "2026-08-28T20:21:00.000Z", actorId: "p1", actorRole: "paciente", action: "Diário compartilhado", detail: "Paciente compartilhou uma reflexão com a profissional" },
    ],
    consents,
    twoFactorEnabled: false,
  }
}

function encryptState(state: FullPilotState) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", storageKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(state), "utf8"), cipher.final()])
  return JSON.stringify({
    version: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  })
}

function decryptState(raw: string) {
  const envelope = JSON.parse(raw) as { version: number; iv: string; tag: string; ciphertext: string }
  if (envelope.version !== 1) throw new Error("Unsupported encrypted state version")
  const decipher = createDecipheriv("aes-256-gcm", storageKey(), Buffer.from(envelope.iv, "base64"))
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8")
  const stored = JSON.parse(plaintext) as Omit<FullPilotState, "schemaVersion" | "settings" | "consents"> & {
    schemaVersion: number
    settings: Record<string, CheckinSettings & Record<string, unknown>>
    consents: Record<string, ConsentState & Record<string, unknown>>
  }
  if (![2, 3].includes(stored.schemaVersion)) throw new Error("Unsupported pilot state schema")

  // Mantém somente os campos reconhecidos pelo modelo de dados atual.
  const migrated: FullPilotState = {
    ...stored,
    schemaVersion: 3,
    settings: Object.fromEntries(Object.entries(stored.settings).map(([patientId, setting]) => [patientId, {
      patientId: setting.patientId,
      enabled: setting.enabled,
      frequency: setting.frequency,
    }])),
    sessions: Array.isArray((stored as { sessions?: unknown }).sessions) ? (stored as { sessions: ScheduledSession[] }).sessions : [],
    consents: Object.fromEntries(Object.entries(stored.consents).map(([patientId, consent]) => [patientId, {
      accepted: consent.accepted,
      shareCheckins: consent.shareCheckins,
      shareDiaryByChoice: consent.shareDiaryByChoice,
      acceptedAt: consent.acceptedAt,
    }])),
  }
  return migrated
}

let inMemoryState: FullPilotState | null = null
let warnedAboutVolatileStorage = false

function isFilesystemStorageError(error: unknown) {
  if (!(error instanceof Error) || !("code" in error)) return false
  return ["ENOENT", "EROFS", "EACCES", "EPERM"].includes(String(error.code))
}

async function persistState(state: FullPilotState) {
  const snapshot = structuredClone(state)
  try {
    await mkdir(dataDirectory, { recursive: true })
    await writeFile(temporaryDataFile, encryptState(snapshot), { encoding: "utf8", mode: 0o600 })
    await rename(temporaryDataFile, dataFile)
    inMemoryState = snapshot
  } catch (error) {
    if (!isFilesystemStorageError(error)) throw error

    // Alguns runtimes serverless não permitem escrita durável no diretório da
    // aplicação. Mantemos o estado em memória como contingência para que o
    // piloto continue funcional no mesmo processo e nunca esconda os pacientes
    // demonstrativos por uma falha de filesystem.
    inMemoryState = snapshot
    if (!warnedAboutVolatileStorage) {
      console.warn("Persistência em arquivo indisponível; o piloto está usando armazenamento volátil em memória neste processo.")
      warnedAboutVolatileStorage = true
    }
  }
}

async function readState() {
  try {
    const state = decryptState(await readFile(dataFile, "utf8"))
    inMemoryState = structuredClone(state)
    return state
  } catch (error) {
    const missing = isFilesystemStorageError(error) && String((error as NodeJS.ErrnoException).code) === "ENOENT"

    if (inMemoryState) return structuredClone(inMemoryState)
    if (!missing) console.warn("The pilot state could not be read; a fresh encrypted state will be created.")

    const initialState = createInitialState()
    await persistState(initialState)
    return structuredClone(initialState)
  }
}

let mutationQueue: Promise<unknown> = Promise.resolve()

function activePatientIds(state: FullPilotState) {
  return new Set(state.patients.filter((patient) => !patient.archivedAt).map((patient) => patient.id))
}

export function viewForUser(state: FullPilotState, user: User): PilotView {
  if (user.role === "paciente") {
    const consent = state.consents[user.id] || defaultConsent()
    return {
      patients: state.patients.filter((patient) => patient.id === user.id && !patient.archivedAt),
      checkins: state.checkins.filter((entry) => entry.patientId === user.id),
      tasks: state.tasks.filter((task) => task.patientId === user.id),
      diary: state.diary.filter((entry) => entry.patientId === user.id),
      notes: state.notes.filter((note) => note.patientId === user.id && note.kind === "prontuario"),
      settings: { [user.id]: state.settings[user.id] || defaultSettings(user.id) },
      invites: [],
      sessions: state.sessions.filter((session) => session.patientId === user.id),
      audit: state.audit.filter((event) => event.actorId === user.id).slice(0, 30),
      consent,
      twoFactorEnabled: false,
    }
  }

  const activeIds = activePatientIds(state)
  return {
    patients: state.patients.filter((patient) => activeIds.has(patient.id)),
    checkins: state.checkins.filter((entry) => activeIds.has(entry.patientId) && state.consents[entry.patientId]?.shareCheckins),
    tasks: state.tasks.filter((task) => activeIds.has(task.patientId)),
    diary: state.diary.filter((entry) => activeIds.has(entry.patientId) && entry.visibility === "compartilhado"),
    notes: state.notes.filter((note) => activeIds.has(note.patientId)),
    settings: Object.fromEntries(Object.entries(state.settings).filter(([patientId]) => activeIds.has(patientId))),
    invites: state.invites,
    sessions: state.sessions.filter((session) => activeIds.has(session.patientId)),
    audit: state.audit.slice(0, 30),
    consent: defaultConsent(),
    twoFactorEnabled: state.twoFactorEnabled,
  }
}

export async function getPilotView(user: User) {
  return viewForUser(await readState(), user)
}

function objectPayload(payload: unknown) {
  return payload && typeof payload === "object" ? payload as Record<string, unknown> : {}
}

function textValue(value: unknown, maximum = 2000) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : ""
}

function numberInRange(value: unknown, minimum: number, maximum: number) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < minimum || number > maximum) throw new PilotActionError("Valor fora da faixa permitida.", 400)
  return number
}

function ensureRole(user: User, role: User["role"]) {
  if (user.role !== role) throw new PilotActionError("Ação não permitida para este perfil.", 403)
}

function ensurePatientExists(state: FullPilotState, patientId: string) {
  if (!state.patients.some((patient) => patient.id === patientId && !patient.archivedAt)) {
    throw new PilotActionError("Paciente não encontrado ou vínculo encerrado.", 404)
  }
}

function audit(state: FullPilotState, user: User, action: string, detail: string) {
  state.audit.unshift({ id: randomUUID(), at: new Date().toISOString(), actorId: user.id, actorRole: user.role, action, detail })
  state.audit = state.audit.slice(0, 100)
}

export class PilotActionError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

async function mutate(user: User, updater: (state: FullPilotState) => void) {
  const operation = mutationQueue.then(async () => {
    const state = await readState()
    updater(state)
    await persistState(state)
    return viewForUser(state, user)
  })
  mutationQueue = operation.catch(() => undefined)
  return operation
}

export async function performPilotAction(user: User, action: string, rawPayload: unknown) {
  const payload = objectPayload(rawPayload)
  return mutate(user, (state) => {
    if (action === "add-checkin") {
      ensureRole(user, "paciente")
      const entry: MoodEntry = {
        id: randomUUID(),
        patientId: user.id,
        date: formatLocalDate(),
        mood: numberInRange(payload.mood, 1, 5),
        moodLabel: textValue(payload.moodLabel, 40),
        note: textValue(payload.note, 320),
        activities: Array.isArray(payload.activities) ? payload.activities.map((item) => textValue(item, 40)).filter(Boolean).slice(0, 10) : [],
        sleepQuality: numberInRange(payload.sleepQuality, 1, 5),
        anxietyLevel: numberInRange(payload.anxietyLevel, 1, 5),
        energyLevel: numberInRange(payload.energyLevel, 1, 5),
      }
      state.checkins.unshift(entry)
      audit(state, user, "Check-in realizado", state.consents[user.id]?.shareCheckins ? "Registro disponibilizado à profissional vinculada" : "Registro mantido no acesso do paciente")
      return
    }

    if (action === "update-consent") {
      ensureRole(user, "paciente")
      const current = state.consents[user.id] || defaultConsent()
      state.consents[user.id] = {
        ...current,
        accepted: typeof payload.accepted === "boolean" ? payload.accepted : current.accepted,
        shareCheckins: typeof payload.shareCheckins === "boolean" ? payload.shareCheckins : current.shareCheckins,
        shareDiaryByChoice: typeof payload.shareDiaryByChoice === "boolean" ? payload.shareDiaryByChoice : current.shareDiaryByChoice,
        acceptedAt: payload.accepted === true ? new Date().toISOString() : current.acceptedAt,
      }
      audit(state, user, "Preferências de privacidade", "Consentimento atualizado pelo paciente")
      return
    }

    if (action === "add-diary") {
      ensureRole(user, "paciente")
      const requestedVisibility = payload.visibility === "compartilhado" ? "compartilhado" : "privado"
      const visibility = state.consents[user.id]?.shareDiaryByChoice ? requestedVisibility : "privado"
      state.diary.unshift({
        id: randomUUID(),
        patientId: user.id,
        date: new Date().toISOString(),
        emotion: textValue(payload.emotion, 80),
        intensity: numberInRange(payload.intensity, 1, 5),
        context: textValue(payload.context, 1200),
        body: textValue(payload.body, 800),
        strategy: textValue(payload.strategy, 800),
        visibility,
      })
      audit(state, user, visibility === "compartilhado" ? "Diário compartilhado" : "Diário privado", visibility === "compartilhado" ? "Nova reflexão disponibilizada à profissional" : "Reflexão mantida privada")
      return
    }

    if (action === "report-task-completion") {
      ensureRole(user, "paciente")
      const task = state.tasks.find((item) => item.id === textValue(payload.id, 100) && item.patientId === user.id)
      if (!task) throw new PilotActionError("Atividade não encontrada.", 404)
      const reflection = textValue(payload.reflection, 1600)
      if (reflection.length < 10 || payload.attested !== true) throw new PilotActionError("Confirme a realização e descreva brevemente sua experiência.", 400)
      task.status = "conclusao_informada"
      task.completion = {
        reportedAt: new Date().toISOString(),
        performedAt: textValue(payload.performedAt, 40) || new Date().toISOString(),
        reflection,
        difficulty: numberInRange(payload.difficulty, 1, 5),
        nextSessionNote: textValue(payload.nextSessionNote, 800) || undefined,
        attested: true,
        reportedBy: user.id,
        taskVersion: task.version,
      }
      task.review = undefined
      audit(state, user, "Conclusão informada", task.title)
      return
    }

    if (action === "add-task") {
      ensureRole(user, "psicologo")
      const patientId = textValue(payload.patientId, 100)
      ensurePatientExists(state, patientId)
      const title = textValue(payload.title, 180)
      if (!title) throw new PilotActionError("Informe o título da atividade.", 400)
      state.tasks.unshift({
        id: randomUUID(),
        patientId,
        title,
        description: textValue(payload.description, 1600),
        dueDate: textValue(payload.dueDate, 10) || formatLocalDate(),
        status: "pendente",
        createdAt: new Date().toISOString(),
        version: 1,
      })
      audit(state, user, "Atividade criada", title)
      return
    }

    if (action === "update-task") {
      ensureRole(user, "psicologo")
      const task = state.tasks.find((item) => item.id === textValue(payload.id, 100))
      if (!task) throw new PilotActionError("Atividade não encontrada.", 404)
      const patientId = textValue(payload.patientId, 100) || task.patientId
      ensurePatientExists(state, patientId)
      const requestedStatus = textValue(payload.status, 40) as TaskStatus
      if (requestedStatus && !["pendente", "em_andamento"].includes(requestedStatus)) {
        throw new PilotActionError("A conclusão deve ser informada pelo paciente e revisada pela profissional.", 400)
      }
      task.patientId = patientId
      task.title = textValue(payload.title, 180) || task.title
      task.description = textValue(payload.description, 1600)
      task.dueDate = textValue(payload.dueDate, 10) || task.dueDate
      if (requestedStatus) task.status = requestedStatus
      task.version += 1
      if (task.completion && task.completion.taskVersion !== task.version) {
        task.completion = undefined
        task.review = undefined
      }
      audit(state, user, "Atividade editada", task.title)
      return
    }

    if (action === "set-task-status") {
      ensureRole(user, "psicologo")
      const task = state.tasks.find((item) => item.id === textValue(payload.id, 100))
      const status = textValue(payload.status, 40) as TaskStatus
      if (!task || !["pendente", "em_andamento"].includes(status)) throw new PilotActionError("Status inválido para alteração profissional.", 400)
      task.status = status
      task.completion = undefined
      task.review = undefined
      audit(state, user, "Atividade atualizada", `${task.title}: ${status.replace("_", " ")}`)
      return
    }

    if (action === "review-task") {
      ensureRole(user, "psicologo")
      const task = state.tasks.find((item) => item.id === textValue(payload.id, 100))
      if (!task?.completion) throw new PilotActionError("A atividade ainda não possui conclusão informada.", 400)
      task.status = "revisada"
      task.review = { reviewedAt: new Date().toISOString(), reviewedBy: user.id }
      audit(state, user, "Atividade revisada em sessão", task.title)
      return
    }

    if (action === "add-note") {
      ensureRole(user, "psicologo")
      const patientId = textValue(payload.patientId, 100)
      ensurePatientExists(state, patientId)
      const title = textValue(payload.title, 180)
      const content = textValue(payload.content, 4000)
      if (!title || !content) throw new PilotActionError("Preencha título e conteúdo do registro.", 400)
      const kind = payload.kind === "privada" ? "privada" : "prontuario"
      state.notes.unshift({ id: randomUUID(), patientId, kind, title, content, createdAt: new Date().toISOString() })
      audit(state, user, kind === "prontuario" ? "Prontuário atualizado" : "Anotação privada criada", title)
      return
    }

    if (action === "update-settings") {
      ensureRole(user, "psicologo")
      const patientId = textValue(payload.patientId, 100)
      ensurePatientExists(state, patientId)
      const current = state.settings[patientId] || defaultSettings(patientId)
      state.settings[patientId] = {
        ...current,
        enabled: payload.enabled && typeof payload.enabled === "object" ? { ...current.enabled, ...payload.enabled as CheckinSettings["enabled"] } : current.enabled,
        frequency: ["diario", "3x_semana", "semanal"].includes(String(payload.frequency)) ? payload.frequency as CheckinSettings["frequency"] : current.frequency,
      }
      audit(state, user, "Acompanhamento configurado", `Preferências atualizadas para ${patientId}`)
      return
    }

    if (action === "import-schedule") {
      ensureRole(user, "psicologo")
      const rows = Array.isArray(payload.rows) ? payload.rows : []
      if (!rows.length || rows.length > 500) throw new PilotActionError("A planilha deve conter entre 1 e 500 horários.", 400)
      let imported = 0
      for (const raw of rows) {
        const row = raw && typeof raw === "object" ? raw as Record<string, unknown> : {}
        const patientIdValue = textValue(row.patientId, 100)
        const name = textValue(row.patientName, 180).toLowerCase()
        const email = textValue(row.patientEmail, 240).toLowerCase()
        const patient = state.patients.find((item) => !item.archivedAt && (
          (patientIdValue && item.id === patientIdValue) ||
          (email && item.email.toLowerCase() === email) ||
          (name && item.name.toLowerCase() === name)
        ))
        const date = textValue(row.date, 10)
        const time = textValue(row.time, 5)
        if (!patient || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) continue
        const duration = Number(row.durationMinutes ?? 50)
        if (!Number.isFinite(duration) || duration < 15 || duration > 240) continue
        state.sessions.push({
          id: randomUUID(),
          patientId: patient.id,
          date,
          time,
          durationMinutes: Math.round(duration),
          note: textValue(row.note, 300) || undefined,
          createdAt: new Date().toISOString(),
          source: "planilha",
        })
        imported += 1
      }
      if (!imported) throw new PilotActionError("Nenhum horário válido foi encontrado. Confira paciente, data (AAAA-MM-DD) e hora (HH:MM).", 400)
      state.sessions.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
      audit(state, user, "Agenda importada", `${imported} horário(s) adicionados por planilha`)
      return
    }

    if (action === "create-invite") {
      ensureRole(user, "psicologo")
      const name = textValue(payload.name, 180)
      const email = textValue(payload.email, 240).toLowerCase()
      if (!name || !email.includes("@")) throw new PilotActionError("Informe nome e e-mail válidos.", 400)
      state.invites.unshift({ id: randomUUID(), name, email, sentAt: new Date().toISOString(), status: "pendente" })
      audit(state, user, "Convite criado", `${name} · ${email}`)
      return
    }

    if (action === "refresh-invite") {
      ensureRole(user, "psicologo")
      const invite = state.invites.find((item) => item.id === textValue(payload.id, 100))
      if (!invite) throw new PilotActionError("Convite não encontrado.", 404)
      invite.sentAt = new Date().toISOString()
      invite.status = "pendente"
      audit(state, user, "Convite reenviado", invite.email)
      return
    }

    if (action === "archive-patient") {
      ensureRole(user, "psicologo")
      const patient = state.patients.find((item) => item.id === textValue(payload.id, 100) && !item.archivedAt)
      if (!patient) throw new PilotActionError("Paciente não encontrado.", 404)
      patient.archivedAt = new Date().toISOString()
      patient.archivedBy = user.id
      patient.status = "inativo"
      audit(state, user, "Vínculo encerrado", patient.name)
      return
    }

    if (action === "set-two-factor") {
      ensureRole(user, "psicologo")
      state.twoFactorEnabled = payload.enabled === true
      audit(state, user, "Segurança da conta", state.twoFactorEnabled ? "Autenticação em duas etapas marcada como ativa no piloto" : "Autenticação em duas etapas marcada como inativa no piloto")
      return
    }

    if (action === "add-audit") {
      audit(state, user, textValue(payload.action, 180), textValue(payload.detail, 600))
      return
    }

    throw new PilotActionError("Ação desconhecida.", 400)
  })
}

export function getDefaultCheckinSettings(patientId: string) {
  return defaultSettings(patientId)
}
