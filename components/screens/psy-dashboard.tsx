"use client"

import { useMemo, useState } from "react"
import { PsychologistLayout } from "./psychologist-layout"
import { useNavigation } from "@/lib/navigation"
import { usePilot } from "@/lib/pilot-context"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, ClipboardList, Clock3, FileText, Send, UserRoundCheck, Upload, Download, BookHeart, Compass } from "lucide-react"

const priorities = [
  { id: "p1", name: "Ana Beatriz Silva", reason: "Ansiedade aumentou em 2 dos últimos 3 registros", tag: "Revisar antes da sessão" },
  { id: "p9", name: "Isabela Moreira", reason: "Último check-in há 6 dias", tag: "Baixa adesão" },
  { id: "p4", name: "Daniel Ferreira Lima", reason: "Acompanhamento pausado; retorno previsto", tag: "Acompanhar" },
]


function Metric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <article className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)]"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-[#70777b]">{label}</span><span className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb] [&>svg]:h-4 [&>svg]:w-4">{icon}</span></div><strong className="block text-3xl tracking-tight text-[#1f2427]">{value}</strong><small className="mt-1 block text-[#80878b]">{detail}</small></article>
}

export function PsyDashboard() {
  const { navigate } = useNavigation()
  const { patients, tasks, invites, sessions, diary, importSchedule, error } = usePilot()
  const active = patients.filter((patient) => patient.status === "ativo").length
  const openTasks = tasks.filter((task) => !["conclusao_informada", "revisada"].includes(task.status)).length
  const [agendaOpen, setAgendaOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [importSummary, setImportSummary] = useState("")
  const [localError, setLocalError] = useState("")

  const upcoming = useMemo(() => sessions
    .filter((session) => `${session.date}T${session.time}` >= new Date().toISOString().slice(0, 16))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .slice(0, 6), [sessions])

  const parseCsv = (text: string) => {
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim())
    if (lines.length < 2) throw new Error("A planilha precisa ter cabeçalho e pelo menos uma linha.")
    const split = (line: string) => {
      const values: string[] = []
      let current = "", quoted = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          if (quoted && line[i + 1] === '"') { current += '"'; i++; continue }
          quoted = !quoted
        } else if ((char === "," || char === ";") && !quoted) { values.push(current.trim()); current = "" }
        else current += char
      }
      values.push(current.trim())
      return values
    }
    const headers = split(lines[0]).map((item) => item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ""))
    const index = (names: string[]) => headers.findIndex((header) => names.includes(header))
    const patientName = index(["paciente","nome","patient","patientname"])
    const patientEmail = index(["email","emaildopaciente","patientemail"])
    const patientId = index(["patientid","idpaciente","id"])
    const date = index(["data","date"])
    const time = index(["hora","horario","horarioinicio","time"])
    const duration = index(["duracao","duracaominutos","duration","durationminutes"])
    const note = index(["observacao","observacoes","nota","note"])
    if (date < 0 || time < 0 || (patientName < 0 && patientEmail < 0 && patientId < 0)) throw new Error("Use as colunas paciente, data e hora. E-mail ou ID do paciente também podem ser usados.")
    return lines.slice(1).map((line) => {
      const values = split(line)
      return {
        patientName: patientName >= 0 ? values[patientName] : undefined,
        patientEmail: patientEmail >= 0 ? values[patientEmail] : undefined,
        patientId: patientId >= 0 ? values[patientId] : "",
        date: values[date] || "",
        time: values[time] || "",
        durationMinutes: Number(values[duration] || 50),
        note: note >= 0 ? values[note] : undefined,
      }
    }).filter((row) => row.date && row.time)
  }

  const handleAgendaFile = async (file?: File) => {
    if (!file) return
    setFileName(file.name); setLocalError(""); setImportSummary("")
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      await importSchedule(rows)
      setImportSummary(`${rows.length} linha(s) enviada(s) para importação. Linhas sem paciente correspondente ou com formato inválido são ignoradas pelo sistema.`)
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : "Não foi possível importar a planilha.")
    }
  }

  const downloadTemplate = () => {
    const content = "paciente,data,hora,duracao_minutos,observacao\nAna Beatriz Silva,2026-10-01,09:30,50,Sessão regular\nBruno Costa Santos,2026-10-01,11:00,50,Sessão regular"
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }))
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "nous-modelo-agenda.csv"; anchor.click(); URL.revokeObjectURL(url)
  }

  const recentDiary = [...diary].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4)

  return <PsychologistLayout><div className="mx-auto max-w-6xl">
    <header className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-[#2563eb]">Preparação clínica</span><h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Bom dia, Maria.</h1><p className="mt-2 max-w-2xl text-[#687074]">Use o Noûs como um guia: organize o que aconteceu entre as sessões e leve os pontos relevantes para a conversa profissional.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><button onClick={() => setAgendaOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d7dde0] bg-white px-4 py-3 text-sm font-bold text-[#4f565a]"><Upload className="h-4 w-4" /> Importar agenda</button><button onClick={() => navigate("psy-follow-up")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-3 text-sm font-bold text-white"><ClipboardList className="h-4 w-4" /> Organizar acompanhamento</button></div>
    </header>

    <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<UserRoundCheck />} label="Pacientes ativos" value={String(active)} detail={`${patients.length} vínculos cadastrados`} /><Metric icon={<CalendarClock />} label="Sessões próximas" value={String(upcoming.length)} detail="a partir da agenda importada" /><Metric icon={<CheckCircle2 />} label="Adesão semanal" value="78%" detail="check-ins esperados realizados" /><Metric icon={<ClipboardList />} label="Atividades abertas" value={String(openTasks)} detail="em acompanhamento" /></div>

    <section className="mb-5 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-5"><div className="flex items-start gap-3"><Compass className="mt-0.5 h-5 w-5 shrink-0 text-[#2563eb]" /><div><b className="text-sm">Guia de uso em sessão</b><p className="mt-1 text-sm leading-relaxed text-[#56616a]">Os registros, tarefas, agenda e entradas do paciente ajudam a lembrar o período entre sessões. Eles não substituem sua avaliação, escuta ou decisão profissional.</p></div></div></section>

    <div className="grid gap-5 lg:grid-cols-[1.35fr_.9fr]">
      <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-[#1f2427]">Próximas sessões</h2><p className="text-sm text-[#70777b]">Lembretes importados da agenda para preparar a conversa.</p></div><span className="rounded-full bg-[#f3f5f5] px-3 py-1 text-xs font-bold text-[#687074]">Agenda</span></div><div className="divide-y divide-[#e5e9eb]">{upcoming.length ? upcoming.map((session) => { const patient = patients.find((item) => item.id === session.patientId); return <article key={session.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><time className="w-28 shrink-0 text-sm font-bold text-[#4f565a]"><Clock3 className="mr-1.5 inline h-3.5 w-3.5 text-[#2563eb]" />{session.time} · {new Date(`${session.date}T12:00:00`).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}</time><div className="min-w-0 flex-1"><b className="block text-sm text-[#1f2427]">{patient?.name || "Paciente"}</b><small className="text-[#777e82]">{session.durationMinutes} min{session.note ? ` · ${session.note}` : ""}</small></div><button onClick={() => navigate("psy-patient-detail", { patientId: session.patientId, tab: "resumo" })} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#eff6ff] px-4 py-2 text-xs font-bold text-[#1d4ed8]"><FileText className="h-3.5 w-3.5" /> Ver contexto</button></article> }) : <p className="py-6 text-sm text-[#80878b]">Nenhuma sessão futura cadastrada. Importe sua agenda por CSV para criar os lembretes.</p>}</div></section>

      <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)] sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-slate-100 p-2 text-slate-700"><AlertTriangle className="h-5 w-5" /></span><div><h2 className="font-bold text-[#1f2427]">Pontos para revisão</h2><p className="text-sm text-[#70777b]">Sinais baseados no histórico individual.</p></div></div><div className="space-y-2">{priorities.map((priority) => <button key={priority.id} onClick={() => navigate("psy-patient-detail", { patientId: priority.id })} className="group w-full rounded-lg border border-[#e5e9eb] p-3 text-left hover:border-[#93c5fd] hover:bg-[#f7faff]"><div className="flex items-start justify-between gap-3"><div><b className="block text-sm text-[#1f2427]">{priority.name}</b><small className="mt-1 block leading-relaxed text-[#777e82]">{priority.reason}</small></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#aaa49d] transition group-hover:translate-x-1" /></div><span className="mt-2 inline-flex rounded-full bg-[#f3f5f5] px-2 py-1 text-[10px] font-bold text-[#687074]">{priority.tag}</span></button>)}</div></section>
    </div>

    <section className="mt-5 rounded-lg border border-[#dbe5f2] bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.08)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-[#1f2427]">Entradas recentes dos pacientes</h2><p className="text-sm text-[#70777b]">Reflexões compartilhadas recentemente para você revisar antes da sessão.</p></div><BookHeart className="h-5 w-5 text-[#2563eb]" /></div><div className="grid gap-3 sm:grid-cols-2">{recentDiary.map((entry) => { const patient = patients.find((item) => item.id === entry.patientId); return <button key={entry.id} onClick={() => navigate("psy-patient-detail",{patientId:entry.patientId,tab:"timeline"})} className="rounded-lg border border-[#e2e7e9] bg-[#fafbfb] p-4 text-left hover:border-[#93c5fd]"><div className="flex items-center justify-between gap-3"><b className="text-sm">{patient?.name || "Paciente"}</b><span className="text-[10px] text-[#8a9195]">{new Date(entry.date).toLocaleDateString("pt-BR")}</span></div><b className="mt-2 block text-xs text-[#2563eb]">{entry.emotion} · intensidade {entry.intensity}/5</b><p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#687074]">{entry.context}</p></button> })}</div></section>

    <div className="mt-5 grid gap-5 md:grid-cols-2"><section className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-5"><div className="flex items-start gap-3"><Send className="mt-0.5 h-5 w-5 text-[#2563eb]" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><b className="text-sm text-[#2f3539]">Convites aguardando aceite</b><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#2563eb]">{invites.filter((invite) => invite.status === "pendente").length}</span></div><p className="mt-1 text-sm text-[#777e82]">Reenvie o acesso ou confira os dados de contato.</p><button onClick={() => navigate("psy-follow-up")} className="mt-3 text-xs font-bold text-[#1d4ed8]">Gerenciar convites →</button></div></div></section><section className="rounded-lg border border-[#dfe4e6] bg-white p-5"><b className="text-sm text-[#2f3539]">Leitura responsável</b><p className="mt-2 text-sm leading-relaxed text-[#70777b]">Os alertas organizam prioridades. Eles não constituem diagnóstico, recomendação automática nem monitoramento emergencial.</p></section></div>

    <Dialog open={agendaOpen} onOpenChange={setAgendaOpen}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Importar horários da agenda</DialogTitle><DialogDescription>Envie um CSV exportado da sua planilha. Use nome, e-mail ou ID do paciente para vincular cada sessão.</DialogDescription></DialogHeader><div className="space-y-4"><div className="rounded-lg border border-[#dbe5f2] bg-[#f7faff] p-4 text-sm text-[#56616a]"><b>Colunas aceitas</b><p className="mt-1 text-xs leading-5">paciente, data (AAAA-MM-DD), hora (HH:MM), duracao_minutos e observacao. Você também pode usar email ou patientId no lugar do nome.</p></div><label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#cfd9e5] bg-[#fafcff] p-8 text-center"><Upload className="h-7 w-7 text-[#2563eb]" /><b className="mt-2 text-sm">{fileName || "Escolher arquivo CSV"}</b><span className="mt-1 text-xs text-[#7b858c]">Clique para selecionar sua planilha exportada em CSV.</span><input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => void handleAgendaFile(event.target.files?.[0])} /></label><button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 text-xs font-bold text-[#2563eb]"><Download className="h-3.5 w-3.5" /> Baixar modelo de planilha</button>{(localError || error) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{localError || error}</p>}{importSummary && <p className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">{importSummary}</p>}<p className="text-xs leading-relaxed text-[#80878b]">Os horários funcionam como lembretes de organização. Eles não confirmam presença nem substituem a comunicação profissional com o paciente.</p></div></DialogContent></Dialog>
  </div></PsychologistLayout>
}
