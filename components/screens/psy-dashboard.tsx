"use client"

import { PsychologistLayout } from "./psychologist-layout"
import { useNavigation } from "@/lib/navigation"
import { usePilot } from "@/lib/pilot-context"
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardList, Clock3, FileText, Send, UserRoundCheck } from "lucide-react"

const priorities = [
  { id: "p1", name: "Ana Beatriz Silva", reason: "Ansiedade aumentou em 2 dos últimos 3 registros", tag: "Revisar antes da sessão" },
  { id: "p9", name: "Isabela Moreira", reason: "Último check-in há 6 dias", tag: "Baixa adesão" },
  { id: "p4", name: "Daniel Ferreira Lima", reason: "Acompanhamento pausado; retorno previsto", tag: "Acompanhar" },
]

const sessions = [
  { id: "p1", time: "09:30", name: "Ana Beatriz Silva", detail: "7 check-ins · 1 diário compartilhado", ready: true },
  { id: "p2", time: "11:00", name: "Bruno Costa Santos", detail: "3 check-ins · 1 tarefa em aberto", ready: true },
  { id: "p5", time: "15:30", name: "Elena Marques", detail: "Sem registros desde a última sessão", ready: false },
]

function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <article className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)]"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-[#70777b]">{label}</span><span className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb] [&>svg]:h-4 [&>svg]:w-4">{icon}</span></div><strong className="block text-3xl tracking-tight text-[#1f2427]">{value}</strong><small className="mt-1 block text-[#80878b]">{detail}</small></article>
}

export function PsyDashboard() {
  const { navigate } = useNavigation()
  const { patients, tasks, invites } = usePilot()
  const active = patients.filter((patient) => patient.status === "ativo").length
  const openTasks = tasks.filter((task) => !["conclusao_informada", "revisada"].includes(task.status)).length
  return <PsychologistLayout><div className="mx-auto max-w-6xl">
    <header className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-[#2563eb]">Preparação clínica</span><h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Bom dia, Maria.</h1><p className="mt-2 max-w-2xl text-[#687074]">Veja o que mudou entre as sessões e entre na próxima conversa com o contexto organizado.</p></div><button onClick={() => navigate("psy-follow-up")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-bold text-white"><ClipboardList className="h-4 w-4" /> Organizar acompanhamento</button></header>
    <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<UserRoundCheck />} label="Pacientes ativos" value={String(active)} detail={`${patients.length} vínculos cadastrados`} /><Metric icon={<CalendarClock />} label="Sessões hoje" value="4" detail="3 resumos disponíveis" /><Metric icon={<CheckCircle2 />} label="Adesão semanal" value="78%" detail="check-ins esperados realizados" /><Metric icon={<ClipboardList />} label="Atividades abertas" value={String(openTasks)} detail="em acompanhamento" /></div>
    <div className="grid gap-5 lg:grid-cols-[1.35fr_.9fr]">
      <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-[#1f2427]">Próximas sessões</h2><p className="text-sm text-[#70777b]">Resumos rápidos para revisar antes do atendimento.</p></div><span className="rounded-full bg-[#f3f5f5] px-3 py-1 text-xs font-bold text-[#687074]">Hoje</span></div><div className="divide-y divide-[#e5e9eb]">{sessions.map((session) => <article key={session.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><time className="flex w-16 shrink-0 items-center gap-1.5 text-sm font-bold text-[#4f565a]"><Clock3 className="h-3.5 w-3.5 text-[#2563eb]" />{session.time}</time><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f3f5f5] text-xs font-bold text-[#4f565a]">{session.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div className="min-w-0 flex-1"><b className="block text-sm text-[#1f2427]">{session.name}</b><small className="text-[#777e82]">{session.detail}</small></div><button onClick={() => navigate("psy-patient-detail", { patientId: session.id, tab: "resumo" })} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold ${session.ready ? "bg-[#eff6ff] text-[#1d4ed8]" : "border border-[#d7dde0] text-[#777e82]"}`}><FileText className="h-3.5 w-3.5" /> {session.ready ? "Ver resumo" : "Abrir cadastro"}</button></article>)}</div></section>
      <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)] sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-slate-100 p-2 text-slate-700"><AlertTriangle className="h-5 w-5" /></span><div><h2 className="font-bold text-[#1f2427]">Pontos para revisão</h2><p className="text-sm text-[#70777b]">Sinais baseados no histórico individual.</p></div></div><div className="space-y-2">{priorities.map((priority) => <button key={priority.id} onClick={() => navigate("psy-patient-detail", { patientId: priority.id })} className="group w-full rounded-lg border border-[#e5e9eb] p-3 text-left hover:border-[#93c5fd] hover:bg-[#f7faff]"><div className="flex items-start justify-between gap-3"><div><b className="block text-sm text-[#1f2427]">{priority.name}</b><small className="mt-1 block leading-relaxed text-[#777e82]">{priority.reason}</small></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#aaa49d] transition group-hover:translate-x-1" /></div><span className="mt-2 inline-flex rounded-full bg-[#f3f5f5] px-2 py-1 text-[10px] font-bold text-[#687074]">{priority.tag}</span></button>)}</div></section>
    </div>
    <div className="mt-5 grid gap-5 md:grid-cols-2"><section className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-5"><div className="flex items-start gap-3"><Send className="mt-0.5 h-5 w-5 text-[#2563eb]" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><b className="text-sm text-[#2f3539]">Convites aguardando aceite</b><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#2563eb]">{invites.filter((invite) => invite.status === "pendente").length}</span></div><p className="mt-1 text-sm text-[#777e82]">Reenvie o acesso ou confira os dados de contato.</p><button onClick={() => navigate("psy-follow-up")} className="mt-3 text-xs font-bold text-[#1d4ed8]">Gerenciar convites →</button></div></div></section><section className="rounded-lg border border-[#dfe4e6] bg-white p-5"><b className="text-sm text-[#2f3539]">Leitura responsável</b><p className="mt-2 text-sm leading-relaxed text-[#70777b]">Os alertas organizam prioridades. Eles não constituem diagnóstico, recomendação automática nem monitoramento emergencial.</p></section></div>
  </div></PsychologistLayout>
}

