// Fonte volátil do protótipo; a camada de produção deve substituir este módulo por um repositório persistente.

export type UserRole = "paciente" | "psicologo"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface MoodEntry {
  id: string
  patientId: string
  date: string
  mood: number
  moodLabel: string
  note: string
  activities: string[]
  sleepQuality: number
  anxietyLevel: number
  energyLevel: number
}

export interface EmotionWheelEntry {
  id: string
  patientId: string
  date: string
  answers: Record<string, number>
  emotions: {
    alegria: number
    tristeza: number
    raiva: number
    medo: number
    surpresa: number
    nojo: number
    confianca: number
    antecipacao: number
  }
}

export interface Patient {
  id: string
  name: string
  email: string
  age: number
  startDate: string
  lastSession: string
  status: "ativo" | "inativo" | "pausado"
  notes: string
  phone: string
  diagnosis?: string
  archivedAt?: string
  archivedBy?: string
}

// Dados fictícios usados exclusivamente para inicializar o ambiente demonstrativo.
export const initialPatients: Patient[] = [
  { id: "p1", name: "Ana Beatriz Silva", email: "ana@email.com", age: 28, startDate: "2025-03-15", lastSession: "2026-08-26", status: "ativo", notes: "Acompanhamento de ansiedade, progresso positivo", phone: "(11) 99999-1111", diagnosis: "Hipótese clínica em acompanhamento" },
  { id: "p2", name: "Bruno Costa Santos", email: "bruno@email.com", age: 35, startDate: "2025-06-01", lastSession: "2026-08-25", status: "ativo", notes: "Acompanhamento semanal de humor e rotina", phone: "(11) 99999-2222" },
  { id: "p3", name: "Camila Rodrigues", email: "camila@email.com", age: 22, startDate: "2025-09-10", lastSession: "2026-08-24", status: "ativo", notes: "Dificuldades de relacionamento", phone: "(11) 99999-3333" },
  { id: "p4", name: "Daniel Ferreira Lima", email: "daniel@email.com", age: 41, startDate: "2025-01-20", lastSession: "2026-08-10", status: "pausado", notes: "Sobrecarga profissional, retorno previsto em setembro", phone: "(11) 99999-4444" },
  { id: "p5", name: "Elena Marques", email: "elena@email.com", age: 30, startDate: "2025-11-05", lastSession: "2026-08-27", status: "ativo", notes: "Acompanhamento de situações sociais", phone: "(11) 99999-5555" },
  { id: "p6", name: "Felipe Almeida", email: "felipe@email.com", age: 26, startDate: "2025-04-12", lastSession: "2026-07-28", status: "inativo", notes: "Acompanhamento finalizado em julho", phone: "(11) 99999-6666" },
  { id: "p7", name: "Gabriela Nunes", email: "gabriela@email.com", age: 33, startDate: "2025-08-20", lastSession: "2026-08-26", status: "ativo", notes: "Regulação emocional e rotina de sono", phone: "(11) 99999-7777" },
  { id: "p8", name: "Henrique Barbosa", email: "henrique@email.com", age: 45, startDate: "2025-02-10", lastSession: "2026-08-23", status: "ativo", notes: "Acompanhamento de sono", phone: "(11) 99999-8888" },
  { id: "p9", name: "Isabela Moreira", email: "isabela@email.com", age: 19, startDate: "2026-01-05", lastSession: "2026-08-25", status: "ativo", notes: "Ajuste acadêmico e ansiedade de desempenho", phone: "(11) 99999-9999" },
  { id: "p10", name: "João Pedro Souza", email: "joao@email.com", age: 38, startDate: "2025-07-15", lastSession: "2026-08-22", status: "ativo", notes: "Processo de luto", phone: "(11) 99999-0000" },
]

export const mockMoodEntries: MoodEntry[] = [
  { id: "m1", patientId: "p1", date: "2026-08-29", mood: 3, moodLabel: "Moderado", note: "Manhã produtiva, mas fiquei mais ansiosa com uma demanda urgente.", activities: ["Trabalho", "Descanso"], sleepQuality: 3, anxietyLevel: 4, energyLevel: 3 },
  { id: "m2", patientId: "p1", date: "2026-08-28", mood: 4, moodLabel: "Alto", note: "Consegui praticar a respiração quando percebi tensão.", activities: ["Trabalho", "Exercício"], sleepQuality: 4, anxietyLevel: 2, energyLevel: 4 },
  { id: "m3", patientId: "p1", date: "2026-08-27", mood: 3, moodLabel: "Moderado", note: "Um pouco de preocupação no final da tarde.", activities: ["Trabalho", "Família"], sleepQuality: 3, anxietyLevel: 3, energyLevel: 3 },
  { id: "m4", patientId: "p1", date: "2026-08-26", mood: 2, moodLabel: "Baixo", note: "Discussão no trabalho influenciou o restante do dia.", activities: ["Trabalho"], sleepQuality: 2, anxietyLevel: 4, energyLevel: 2 },
  { id: "m5", patientId: "p1", date: "2026-08-25", mood: 4, moodLabel: "Alto", note: "Dia mais leve com tempo para descansar.", activities: ["Descanso", "Família"], sleepQuality: 5, anxietyLevel: 1, energyLevel: 4 },
  { id: "m6", patientId: "p1", date: "2026-08-24", mood: 3, moodLabel: "Moderado", note: "Rotina estável e sem acontecimentos marcantes.", activities: ["Trabalho", "Estudo"], sleepQuality: 3, anxietyLevel: 2, energyLevel: 3 },
  { id: "m7", patientId: "p1", date: "2026-08-23", mood: 4, moodLabel: "Alto", note: "Encontrei amigos e me senti mais presente.", activities: ["Social", "Exercício"], sleepQuality: 4, anxietyLevel: 1, energyLevel: 4 },
]

export const mockEmotionEntries: EmotionWheelEntry[] = [
  {
    id: "e1", patientId: "p1", date: "2026-02-20",
    answers: {},
    emotions: { alegria: 7, tristeza: 2, raiva: 1, medo: 3, surpresa: 4, nojo: 1, confianca: 8, antecipacao: 6 },
  },
  {
    id: "e2", patientId: "p1", date: "2026-02-13",
    answers: {},
    emotions: { alegria: 5, tristeza: 4, raiva: 3, medo: 5, surpresa: 2, nojo: 1, confianca: 5, antecipacao: 4 },
  },
]

export const moodLabels: Record<number, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Moderado",
  4: "Alto",
  5: "Muito alto",
}

export const moodColors: Record<number, string> = {
  1: "#78716c",
  2: "#a16207",
  3: "#c2410c",
  4: "#0f766e",
  5: "#115e59",
}

export const emotionQuestions = [
  { id: "q1", question: "Nas ultimas 24 horas, com que frequencia voce se sentiu feliz ou alegre?", emotion: "alegria" as const, description: "Momentos de riso, satisfacao, prazer" },
  { id: "q2", question: "Nas ultimas 24 horas, com que frequencia voce se sentiu triste ou melancolico(a)?", emotion: "tristeza" as const, description: "Momentos de choro, desanimo, solidao" },
  { id: "q3", question: "Nas ultimas 24 horas, com que frequencia voce sentiu raiva ou irritacao?", emotion: "raiva" as const, description: "Momentos de frustacao, impaciencia, revolta" },
  { id: "q4", question: "Nas ultimas 24 horas, com que frequencia voce sentiu medo ou preocupacao?", emotion: "medo" as const, description: "Momentos de ansiedade, nervosismo, inseguranca" },
  { id: "q5", question: "Nas ultimas 24 horas, com que frequencia voce se sentiu surpreso(a)?", emotion: "surpresa" as const, description: "Momentos inesperados, espanto, admiracao" },
  { id: "q6", question: "Nas ultimas 24 horas, com que frequencia voce sentiu repulsa ou desconforto?", emotion: "nojo" as const, description: "Momentos de rejeicao, aversao, desagrado" },
  { id: "q7", question: "Nas ultimas 24 horas, o quanto voce se sentiu confiante em si mesmo(a)?", emotion: "confianca" as const, description: "Sensacao de seguranca, autoestima, determinacao" },
  { id: "q8", question: "Nas ultimas 24 horas, o quanto voce sentiu expectativa ou antecipacao sobre o futuro?", emotion: "antecipacao" as const, description: "Expectativa, planejamento, esperanca" },
]

export const meditationsList = [
  { id: "med1", title: "Respiracao Consciente", duration: "5 min", category: "Ansiedade", description: "Uma meditacao guiada focada na respiracao para reduzir a ansiedade e trazer calma ao momento presente." },
  { id: "med2", title: "Body Scan Relaxante", duration: "10 min", category: "Relaxamento", description: "Escaneamento corporal progressivo para aliviar tensoes musculares e promover relaxamento profundo." },
  { id: "med3", title: "Mindfulness Matinal", duration: "7 min", category: "Foco", description: "Comece seu dia com clareza mental e intencao positiva atraves desta meditacao matinal." },
  { id: "med4", title: "Meditacao para Dormir", duration: "15 min", category: "Sono", description: "Guiada para ajudar voce a relaxar e preparar o corpo e mente para uma noite de sono reparador." },
  { id: "med5", title: "Autocompaixao", duration: "8 min", category: "Autoestima", description: "Pratique a gentileza consigo mesmo e desenvolva uma relacao mais amorosa com seus pensamentos." },
  { id: "med6", title: "Ancoragem no Presente", duration: "5 min", category: "Ansiedade", description: "Tecnica de grounding para momentos de crise de ansiedade, trazendo voce de volta ao aqui e agora." },
]
