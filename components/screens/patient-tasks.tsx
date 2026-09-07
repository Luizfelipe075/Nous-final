"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, ClipboardCheck, Clock3, LockKeyhole, MessageSquareText } from "lucide-react"
import { PatientLayout } from "./patient-layout"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useNavigation } from "@/lib/navigation"
import { usePilot, type TherapeuticTask } from "@/lib/pilot-context"
import { formatCalendarDate, formatDateTime } from "@/lib/date"

const taskStatus = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  conclusao_informada: "Conclusão informada",
  revisada: "Revisada em sessão",
} as const

function currentLocalDateTime() {
  const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
  return date.toISOString().slice(0, 16)
}

export function PatientTasks() {
  const { user } = useAuth()
  const { params } = useNavigation()
  const { tasks, reportTaskCompletion, error } = usePilot()
  const patientTasks = useMemo(() => tasks.filter((task) => task.patientId === user?.id), [tasks, user?.id])
  const completed = patientTasks.filter((task) => ["conclusao_informada", "revisada"].includes(task.status)).length
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [performedAt, setPerformedAt] = useState(currentLocalDateTime())
  const [reflection, setReflection] = useState("")
  const [difficulty, setDifficulty] = useState(3)
  const [nextSessionNote, setNextSessionNote] = useState("")
  const [attested, setAttested] = useState(false)
  const selectedTask = patientTasks.find((task) => task.id === selectedTaskId) || null

  useEffect(() => {
    if (params.taskId && patientTasks.some((task) => task.id === params.taskId)) setSelectedTaskId(params.taskId)
  }, [params.taskId, patientTasks])

  const openTask = (task: TherapeuticTask) => {
    setSelectedTaskId(task.id)
    setPerformedAt(currentLocalDateTime())
    setReflection("")
    setDifficulty(3)
    setNextSessionNote("")
    setAttested(false)
  }

  const submitCompletion = async () => {
    if (!selectedTask || reflection.trim().length < 10 || !attested) return
    await reportTaskCompletion(selectedTask.id, {
      performedAt: new Date(performedAt).toISOString(),
      reflection: reflection.trim(),
      difficulty,
      nextSessionNote: nextSessionNote.trim(),
      attested,
    })
  }

  return <PatientLayout><div className="mx-auto max-w-5xl">
    <header className="mb-7">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-[#ff7100]">Plano entre sessões</span>
      <h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Minhas atividades</h1>
      <p className="mt-2 max-w-2xl text-[#687074]">Atividades combinadas com sua psicóloga. Faça no seu ritmo e registre sua experiência quando concluir.</p>
    </header>

    <section className="mb-5 rounded-lg border border-[#eadfd9] bg-[#fff8f3] p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><b className="text-sm text-[#2f3539]">Progresso deste ciclo</b><p className="mt-1 text-xs text-[#777e82]">{completed} de {patientTasks.length} atividades com conclusão informada</p></div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#eadfd9] sm:w-56"><div className="h-full rounded-full bg-[#ff7100] transition-all" style={{ width: `${patientTasks.length ? completed / patientTasks.length * 100 : 0}%` }} /></div>
      </div>
    </section>

    <div className="space-y-4">
      {patientTasks.map((task) => {
        const reported = Boolean(task.completion)
        return <article key={task.id} className={`rounded-lg border bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.10)] ${task.status === "revisada" ? "border-emerald-200" : "border-black/5"}`}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-[#1f2427]">{task.title}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${task.status === "revisada" ? "bg-emerald-50 text-emerald-700" : task.status === "conclusao_informada" ? "bg-blue-50 text-blue-700" : "bg-[#fff0e4] text-[#b64d20]"}`}>{taskStatus[task.status]}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[#70777b]">{task.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#80878b]"><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Prazo: {formatCalendarDate(task.dueDate)}</span>{reported && <span className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Informada em {formatDateTime(task.completion!.reportedAt, { dateStyle: "short", timeStyle: "short" })}</span>}</div>
            </div>
            <button type="button" onClick={() => openTask(task)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ff7100] px-4 py-2.5 text-xs font-bold text-white"><ClipboardCheck className="h-4 w-4" /> {reported ? "Ver relato" : "Registrar conclusão"}</button>
          </div>
        </article>
      })}
    </div>

    <div className="mt-5 flex gap-3 rounded-lg bg-[#f3f5f5] p-4 text-xs leading-relaxed text-[#70777b]"><LockKeyhole className="h-4 w-4 shrink-0 text-[#ff7100]" /> A conclusão é um autorrelato do paciente. O NOUS registra data, versão da atividade e reflexão, mas não afirma que a execução foi comprovada por vigilância.</div>

    <Dialog open={Boolean(selectedTask)} onOpenChange={(open) => { if (!open) setSelectedTaskId(null) }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{selectedTask?.completion ? "Relato de conclusão" : "Registrar conclusão da atividade"}</DialogTitle>
          <DialogDescription>{selectedTask?.title}</DialogDescription>
        </DialogHeader>
        {selectedTask?.completion ? <div className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900"><b className="block">Conclusão informada pelo paciente</b><span className="text-xs text-blue-700">{formatDateTime(selectedTask.completion.reportedAt, { dateStyle: "long", timeStyle: "short" })}</span></div>
          <section><b className="text-sm">Como foi realizar</b><p className="mt-2 rounded-lg bg-[#f6f8f8] p-4 text-sm leading-relaxed text-[#656d71]">{selectedTask.completion.reflection}</p></section>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg border p-4"><small className="text-[#80878b]">Dificuldade percebida</small><b className="mt-1 block">{selectedTask.completion.difficulty}/5</b></div><div className="rounded-lg border p-4"><small className="text-[#80878b]">Situação da revisão</small><b className="mt-1 block">{selectedTask.status === "revisada" ? "Revisada em sessão" : "Aguardando revisão"}</b></div></div>
          {selectedTask.completion.nextSessionNote && <section><b className="text-sm">Para conversar na próxima sessão</b><p className="mt-2 text-sm leading-relaxed text-[#656d71]">{selectedTask.completion.nextSessionNote}</p></section>}
        </div> : <div className="space-y-4">
          <p className="rounded-lg bg-[#fff8f3] p-4 text-xs leading-relaxed text-[#706963]">Conte como foi realizar esta atividade. Este registro é um autorrelato compartilhado com sua psicóloga; não existe resposta certa ou errada.</p>
          <div><Label htmlFor="task-performed-at">Quando você realizou?</Label><Input id="task-performed-at" type="datetime-local" className="mt-2" value={performedAt} onChange={(event) => setPerformedAt(event.target.value)} /></div>
          <div><Label htmlFor="task-reflection">Como você realizou e o que percebeu antes, durante ou depois?</Label><textarea id="task-reflection" rows={5} maxLength={1600} value={reflection} onChange={(event) => setReflection(event.target.value)} className="mt-2 w-full rounded-lg border border-[#dfe4e6] p-3 text-sm outline-none focus:border-[#ff7100]" /><small className="text-[#80878b]">Mínimo de 10 caracteres · {reflection.length}/1600</small></div>
          <div><Label htmlFor="task-difficulty">Qual foi a dificuldade para realizar? {difficulty}/5</Label><Input id="task-difficulty" type="range" min={1} max={5} value={difficulty} onChange={(event) => setDifficulty(Number(event.target.value))} className="mt-2" /></div>
          <div><Label htmlFor="task-next-session">O que gostaria de conversar na próxima sessão? <span className="font-normal text-[#80878b]">(opcional)</span></Label><textarea id="task-next-session" rows={3} maxLength={800} value={nextSessionNote} onChange={(event) => setNextSessionNote(event.target.value)} className="mt-2 w-full rounded-lg border border-[#dfe4e6] p-3 text-sm outline-none focus:border-[#ff7100]" /></div>
          <label className="flex items-start gap-3 rounded-lg border border-[#eadfd9] bg-[#fff8f3] p-4 text-xs leading-relaxed text-[#656d71]"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#ff7100]" checked={attested} onChange={(event) => setAttested(event.target.checked)} /> Confirmo que realizei esta atividade e que este registro corresponde à minha experiência.</label>
          {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}
          <button type="button" onClick={() => void submitCompletion()} disabled={reflection.trim().length < 10 || !attested || !performedAt} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff7100] py-3 text-sm font-bold text-white disabled:opacity-40"><MessageSquareText className="h-4 w-4" /> Confirmar conclusão</button>
        </div>}
      </DialogContent>
    </Dialog>
  </div></PatientLayout>
}

