"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Clock3, Eye, MailPlus, Pencil, Plus, RotateCcw, Save, Send, Settings2, UserRound } from "lucide-react"
import { PsychologistLayout } from "./psychologist-layout"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { usePilot, getDefaultCheckinSettings, type TaskStatus, type TherapeuticTask } from "@/lib/pilot-context"
import { addDays, formatCalendarDate, formatDateTime, formatLocalDate } from "@/lib/date"

const statusLabel: Record<TaskStatus, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  conclusao_informada: "Conclusão informada",
  revisada: "Revisada em sessão",
}

export function PsyFollowUp() {
  const pilot = usePilot()
  const { patients, tasks, invites, settings } = pilot
  const activePatients = patients.filter((patient) => patient.status === "ativo")
  const defaultPatientId = activePatients[0]?.id || patients[0]?.id || ""
  const [taskDialog, setTaskDialog] = useState(false)
  const [inviteDialog, setInviteDialog] = useState(false)
  const [patientId, setPatientId] = useState("p1")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState(addDays(formatLocalDate(), 7))
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [configPatient, setConfigPatient] = useState("p1")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState(false)
  const [editPatientId, setEditPatientId] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editStatus, setEditStatus] = useState<"pendente" | "em_andamento">("pendente")
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null
  const resolvedConfigPatient = patients.some((patient) => patient.id === configPatient) ? configPatient : defaultPatientId
  const config = settings[resolvedConfigPatient] || getDefaultCheckinSettings(resolvedConfigPatient)
  const patientName = (id: string) => patients.find((patient) => patient.id === id)?.name || "Paciente"
  const openTasks = useMemo(() => tasks.filter((task) => ["pendente", "em_andamento"].includes(task.status)), [tasks])

  const submitTask = async () => {
    const targetPatient = patients.some((patient) => patient.id === patientId) ? patientId : defaultPatientId
    if (!title.trim() || !targetPatient) return
    await pilot.addTask({ patientId: targetPatient, title: title.trim(), description: description.trim(), dueDate })
    setTitle("")
    setDescription("")
    setTaskDialog(false)
  }

  const submitInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return
    await pilot.createInvite(inviteName.trim(), inviteEmail.trim())
    setInviteName("")
    setInviteEmail("")
    setInviteDialog(false)
  }

  const openTask = (task: TherapeuticTask) => {
    setSelectedTaskId(task.id)
    setEditPatientId(task.patientId)
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(task.dueDate)
    setEditStatus(task.status === "em_andamento" ? "em_andamento" : "pendente")
    setEditingTask(false)
  }

  const saveTask = async () => {
    if (!selectedTask || !editTitle.trim()) return
    await pilot.updateTask(selectedTask.id, {
      patientId: editPatientId,
      title: editTitle.trim(),
      description: editDescription.trim(),
      dueDate: editDueDate,
      status: editStatus,
    })
    setEditingTask(false)
  }

  return <PsychologistLayout><div className="mx-auto max-w-6xl">
    <header className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-[#2563eb]">Entre as sessões</span><h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Acompanhamento</h1><p className="mt-2 max-w-2xl text-[#687074]">Organize atividades, check-ins e convites em um único fluxo de acompanhamento.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => setInviteDialog(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d7dde0] bg-white px-4 py-2.5 text-sm font-bold text-[#474d51]"><MailPlus className="h-4 w-4" /> Convidar paciente</button><button onClick={() => setTaskDialog(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Nova atividade</button></div>
    </header>

    <div className="mb-5 grid gap-4 sm:grid-cols-3">
      {[{ label: "Atividades abertas", value: openTasks.length, detail: "em acompanhamento" }, { label: "Conclusões informadas", value: tasks.filter((task) => task.status === "conclusao_informada").length, detail: "aguardando revisão" }, { label: "Revisadas", value: tasks.filter((task) => task.status === "revisada").length, detail: "em sessão" }].map((item) => <article key={item.label} className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)]"><small className="text-[#777e82]">{item.label}</small><strong className="mt-2 block text-3xl text-[#1f2427]">{item.value}</strong><span className="text-xs text-[#8a9195]">{item.detail}</span></article>)}
    </div>

    <div className="grid gap-5 lg:grid-cols-[1.45fr_.8fr]">
      <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)] sm:p-6">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-[#1f2427]">Atividades terapêuticas</h2><p className="text-sm text-[#70777b]">Acompanhe prazos, autorrelatos e revisões em sessão.</p></div><span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-bold text-[#1d4ed8]">{openTasks.length} abertas</span></div>
        <div className="space-y-3">{tasks.map((task) => <article key={task.id} className="rounded-lg border border-[#e2e7e9] p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><div className="mb-1 flex flex-wrap items-center gap-2"><b className="text-sm text-[#252a2e]">{task.title}</b><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${task.status === "revisada" ? "bg-emerald-50 text-emerald-700" : task.status === "conclusao_informada" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>{statusLabel[task.status]}</span></div><p className="text-xs text-[#777e82]">{patientName(task.patientId)} · prazo {formatCalendarDate(task.dueDate)}</p>{task.description && <p className="mt-2 text-sm leading-relaxed text-[#656d71]">{task.description}</p>}</div><div className="flex w-full flex-col gap-2 sm:w-44"><button type="button" onClick={() => openTask(task)} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-3 text-xs font-bold text-white"><Eye className="h-3.5 w-3.5" /> Abrir atividade</button>{["pendente", "em_andamento"].includes(task.status) && <Select value={task.status} onValueChange={(value) => void pilot.setTaskStatus(task.id, value as "pendente" | "em_andamento")}><SelectTrigger className="h-9 w-full text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="em_andamento">Em andamento</SelectItem></SelectContent></Select>}</div></div>
        </article>)}</div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)]"><div className="mb-4 flex items-center gap-3"><span className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><Settings2 className="h-4 w-4" /></span><div><h2 className="font-bold text-[#1f2427]">Rotina de check-in</h2><p className="text-xs text-[#777e82]">Configuração individual</p></div></div>
          <Label className="text-xs">Paciente</Label><Select value={resolvedConfigPatient} onValueChange={setConfigPatient}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{activePatients.map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>)}</SelectContent></Select>
          <div className="mt-4 space-y-3">{(["energy", "sleep", "anxiety"] as const).map((key) => <div key={key} className="flex items-center justify-between rounded-lg bg-[#f6f8f8] px-3 py-2.5"><span className="text-sm text-[#4f565a]">{{ energy: "Energia", sleep: "Sono", anxiety: "Ansiedade percebida" }[key]}</span><Switch checked={config.enabled[key]} onCheckedChange={(checked) => void pilot.updateCheckinSettings(resolvedConfigPatient, { enabled: { ...config.enabled, [key]: checked } })} /></div>)}</div>
          <div className="mt-4"><Label className="text-xs">Frequência de registro</Label><Select value={config.frequency} onValueChange={(frequency) => void pilot.updateCheckinSettings(resolvedConfigPatient, { frequency: frequency as typeof config.frequency })}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="diario">Diário</SelectItem><SelectItem value="3x_semana">3x por semana</SelectItem><SelectItem value="semanal">Semanal</SelectItem></SelectContent></Select></div>
        </section>

        <section className="rounded-lg border border-black/5 bg-white p-5"><div className="mb-4 flex items-center gap-3"><Send className="h-4 w-4 text-[#2563eb]" /><div><h2 className="font-bold text-[#1f2427]">Convites recentes</h2><p className="text-xs text-[#777e82]">Links de entrada no piloto</p></div></div><div className="space-y-3">{invites.map((invite) => <div key={invite.id} className="rounded-lg bg-[#f6f8f8] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><b className="block truncate text-sm">{invite.name}</b><small className="block truncate text-[#777e82]">{invite.email}</small></div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">{invite.status}</span></div><button onClick={() => void pilot.refreshInvite(invite.id)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb]"><RotateCcw className="h-3 w-3" /> Reenviar convite</button></div>)}</div></section>
      </aside>
    </div>

    <Dialog open={Boolean(selectedTask)} onOpenChange={(open) => { if (!open) { setSelectedTaskId(null); setEditingTask(false) } }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader><DialogTitle>{editingTask ? "Editar atividade" : selectedTask?.title}</DialogTitle><DialogDescription>{editingTask ? "Atualize a proposta. Uma edição invalida relatos feitos para uma versão anterior." : "Visualize a atividade, o paciente vinculado e o autorrelato."}</DialogDescription></DialogHeader>
        {selectedTask && (editingTask ? <div className="space-y-4">
          <div><Label>Paciente</Label><Select value={editPatientId} onValueChange={setEditPatientId}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{patients.map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>)}</SelectContent></Select></div>
          <div><Label htmlFor="edit-task-title">Título</Label><Input id="edit-task-title" className="mt-2" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></div>
          <div><Label htmlFor="edit-task-description">Orientação</Label><textarea id="edit-task-description" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={5} className="mt-2 w-full rounded-lg border border-[#dfe4e6] p-3 text-sm outline-none focus:border-[#2563eb]" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="edit-task-date">Prazo</Label><Input id="edit-task-date" type="date" className="mt-2" value={editDueDate} onChange={(event) => setEditDueDate(event.target.value)} /></div><div><Label>Status profissional</Label><Select value={editStatus} onValueChange={(value) => setEditStatus(value as "pendente" | "em_andamento")}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pendente">Pendente</SelectItem><SelectItem value="em_andamento">Em andamento</SelectItem></SelectContent></Select></div></div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row"><button type="button" onClick={() => setEditingTask(false)} className="flex-1 rounded-lg border border-[#d7dde0] px-4 py-2.5 text-sm font-bold text-[#687074]">Cancelar</button><button type="button" onClick={() => void saveTask()} disabled={!editTitle.trim()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"><Save className="h-4 w-4" /> Salvar alterações</button></div>
        </div> : <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-lg bg-[#eff6ff] p-4"><span className="rounded-lg bg-white p-2 text-[#2563eb]"><UserRound className="h-5 w-5" /></span><div><small className="block text-[#6b7280]">Paciente</small><b className="text-sm text-[#1f2427]">{patientName(selectedTask.patientId)}</b></div></div>
          <div><div className="mb-2 flex items-center justify-between gap-3"><b className="text-sm text-[#2f3539]">Orientação proposta</b><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{statusLabel[selectedTask.status]}</span></div><p className="text-sm leading-relaxed text-[#656d71]">{selectedTask.description || "Nenhuma orientação adicional foi registrada."}</p></div>
          <div className="grid gap-3 rounded-lg border border-[#e2e7e9] p-4 text-sm sm:grid-cols-2"><div><small className="block text-[#80878b]">Prazo</small><b className="text-[#2f3539]">{formatCalendarDate(selectedTask.dueDate)}</b></div><div><small className="block text-[#80878b]">Versão</small><b className="text-[#2f3539]">{selectedTask.version}</b></div></div>
          {selectedTask.completion && <section className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4"><div><b className="text-sm text-blue-950">Conclusão informada pelo paciente</b><small className="block text-blue-700">{formatDateTime(selectedTask.completion.reportedAt, { dateStyle: "long", timeStyle: "short" })}</small></div><p className="text-sm leading-relaxed text-[#4b5563]">{selectedTask.completion.reflection}</p><div className="flex flex-wrap gap-3 text-xs text-blue-800"><span>Dificuldade: {selectedTask.completion.difficulty}/5</span><span>Versão respondida: {selectedTask.completion.taskVersion}</span></div>{selectedTask.completion.nextSessionNote && <p className="border-t border-blue-100 pt-3 text-xs text-[#4b5563]"><b>Para a próxima sessão:</b> {selectedTask.completion.nextSessionNote}</p>}{selectedTask.status === "conclusao_informada" && <button type="button" onClick={() => void pilot.reviewTask(selectedTask.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white"><CheckCircle2 className="h-4 w-4" /> Marcar como revisada em sessão</button>}</section>}
          <button type="button" onClick={() => setEditingTask(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2563eb] px-4 py-3 text-sm font-bold text-[#1d4ed8]"><Pencil className="h-4 w-4" /> Editar atividade</button>
        </div>)}
      </DialogContent>
    </Dialog>

    <Dialog open={taskDialog} onOpenChange={setTaskDialog}><DialogContent><DialogHeader><DialogTitle>Nova atividade terapêutica</DialogTitle><DialogDescription>A atividade aparecerá no acesso do paciente e no resumo pré-sessão.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label>Paciente</Label><Select value={patients.some((patient) => patient.id === patientId) ? patientId : defaultPatientId} onValueChange={setPatientId}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent>{activePatients.map((patient) => <SelectItem key={patient.id} value={patient.id}>{patient.name}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="task-title">Título</Label><Input id="task-title" className="mt-2" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Registro de pensamentos" /></div><div><Label htmlFor="task-description">Orientação</Label><textarea id="task-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="mt-2 w-full rounded-lg border border-[#dfe4e6] p-3 text-sm outline-none focus:border-[#2563eb]" placeholder="Descreva a atividade de forma objetiva." /></div><div><Label htmlFor="task-date">Prazo</Label><Input id="task-date" type="date" className="mt-2" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div><button onClick={() => void submitTask()} disabled={!title.trim() || !defaultPatientId} className="w-full rounded-lg bg-[#2563eb] py-3 text-sm font-bold text-white disabled:opacity-40"><CheckCircle2 className="mr-2 inline h-4 w-4" /> Criar atividade</button></div></DialogContent></Dialog>

    <Dialog open={inviteDialog} onOpenChange={setInviteDialog}><DialogContent><DialogHeader><DialogTitle>Convidar paciente</DialogTitle><DialogDescription>O piloto registra o convite como pendente; nenhum e-mail real é enviado.</DialogDescription></DialogHeader><div className="space-y-4"><div><Label htmlFor="invite-name">Nome</Label><Input id="invite-name" className="mt-2" value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Nome completo" /></div><div><Label htmlFor="invite-email">E-mail</Label><Input id="invite-email" type="email" className="mt-2" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="paciente@email.com" /></div><div className="flex gap-3 rounded-lg bg-[#eff6ff] p-3 text-xs text-[#64748b]"><Clock3 className="h-4 w-4 shrink-0 text-[#2563eb]" /> O convite exigirá consentimento informado antes do primeiro uso real.</div><button onClick={() => void submitInvite()} disabled={!inviteName.trim() || !inviteEmail.trim()} className="w-full rounded-lg bg-[#2563eb] py-3 text-sm font-bold text-white disabled:opacity-40">Criar convite demonstrativo</button></div></DialogContent></Dialog>
  </div></PsychologistLayout>
}


