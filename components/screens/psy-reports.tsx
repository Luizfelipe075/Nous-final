"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Download, Eye, FileText, Info, Printer, ShieldCheck } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PsychologistLayout } from "./psychologist-layout"
import { useNavigation } from "@/lib/navigation"
import { useCheckins } from "@/lib/use-checkins"
import { usePilot } from "@/lib/pilot-context"
import { likertLabel } from "@/lib/likert"
import { addDays, formatCalendarDate, formatLocalDate } from "@/lib/date"

const series = [
  { key: "humor", label: "Humor", color: "#2563eb" },
  { key: "energia", label: "Energia", color: "#0ea5e9" },
  { key: "sono", label: "Sono", color: "#60a5fa" },
  { key: "ansiedade", label: "Ansiedade", color: "#1e40af" },
]

export function PsyReports() {
  const { params } = useNavigation()
  const { patients } = usePilot()
  const [selectedPatient, setSelectedPatient] = useState(params.patientId || "p1")
  const [viewing, setViewing] = useState(false)
  const patient = patients.find((item) => item.id === selectedPatient) || patients[0]
  const resolvedPatientId = patient?.id || ""
  const { entries } = useCheckins(resolvedPatientId)

  useEffect(() => {
    if (patients.length && !patients.some((item) => item.id === selectedPatient)) setSelectedPatient(patients[0].id)
  }, [patients, selectedPatient])

  const avg = (key: "mood" | "energyLevel" | "sleepQuality" | "anxietyLevel") => entries.length ? (entries.reduce((sum, entry) => sum + entry[key], 0) / entries.length).toFixed(1) : "—"
  const chartData = [...entries].reverse().map((entry) => ({ date: formatCalendarDate(entry.date), humor: entry.mood, energia: entry.energyLevel, sono: entry.sleepQuality, ansiedade: entry.anxietyLevel }))
  const reportPeriods = useMemo(() => {
    const today = formatLocalDate()
    return [0, 7, 14].map((offset) => `${formatCalendarDate(addDays(today, -offset - 6))} – ${formatCalendarDate(addDays(today, -offset))}`)
  }, [])

  const download = () => {
    if (!patient) return
    const text = `RELATÓRIO INDIVIDUAL — NOÛS\nPaciente: ${patient.name}\nPeríodo: últimos ${entries.length} registros\nEscala: Likert 1–5\nHumor médio: ${avg("mood")}/5\nEnergia média: ${avg("energyLevel")}/5\nSono médio: ${avg("sleepQuality")}/5\nAnsiedade média: ${avg("anxietyLevel")}/5\n\nOs indicadores apoiam o acompanhamento e não constituem diagnóstico.`
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `relatorio-${patient.name.toLowerCase().replace(/\s+/g, "-")}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (!patient) return <PsychologistLayout><div className="mx-auto max-w-6xl rounded-lg border bg-white p-8 text-center text-sm text-[#687074]">Nenhum paciente ativo disponível para relatório.</div></PsychologistLayout>

  if (viewing) return <PsychologistLayout><div className="mx-auto max-w-5xl">
    <div className="no-print mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><button onClick={() => setViewing(false)} className="text-sm font-bold text-[#2563eb]">← Voltar aos relatórios</button><div className="flex gap-2"><button onClick={download} className="inline-flex items-center gap-2 rounded-lg border border-[#d7dde0] px-4 py-2.5 text-sm font-bold text-[#687074]"><Download className="h-4 w-4" /> Baixar dados</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white"><Printer className="h-4 w-4" /> Imprimir / salvar PDF</button></div></div>
    <article className="print-report overflow-hidden rounded-lg border border-black/5 bg-white shadow-[0_2px_5px_rgba(31,42,46,.14)]">
      <header className="flex flex-col justify-between gap-4 border-b border-[#dbeafe] bg-[#eff6ff] p-6 sm:flex-row"><div><span className="text-xs font-bold uppercase tracking-[.15em] text-[#2563eb]">Relatório individual</span><h1 className="mt-1 text-2xl font-bold text-[#1f2427]">{patient.name}</h1><p className="text-sm text-[#70777b]">Indicadores longitudinais · escala Likert 1–5</p></div><div className="text-sm text-[#70777b]"><p>Últimos {entries.length} registros autorizados</p><p>Gerado em {new Date().toLocaleDateString("pt-BR")}</p></div></header>
      <div className="p-5 sm:p-7"><div className="mb-7 grid gap-3 sm:grid-cols-4">{[["Humor", avg("mood")], ["Energia", avg("energyLevel")], ["Sono", avg("sleepQuality")], ["Ansiedade", avg("anxietyLevel")]].map(([label, value]) => <div key={label} className="rounded-lg bg-[#f5f7f7] p-4"><small className="text-[#78746e]">{label} médio</small><b className="mt-1 block text-2xl text-[#1f2427]">{value}{value !== "—" && "/5"}</b>{value !== "—" && <span className="text-xs text-[#2563eb]">{likertLabel(Number(value))}</span>}</div>)}</div>
        <section><div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="font-bold text-[#1f2427]">Evolução do período</h2><p className="text-sm text-[#70777b]">Dados filtrados exclusivamente para {patient.name}.</p></div><div className="flex flex-wrap gap-3">{series.map((item) => <span key={item.key} className="flex items-center gap-1.5 text-xs text-[#68645f]"><i className="h-2 w-2 rounded-full" style={{ background: item.color }} />{item.label}</span>)}</div></div><div className="h-72">{entries.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ left: -20, right: 10 }}><CartesianGrid vertical={false} stroke="#e8ecee" /><XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#80878b" }} /><YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#80878b" }} /><Tooltip />{series.map((item) => <Line key={item.key} dataKey={item.key} type="monotone" stroke={item.color} strokeWidth={2.5} dot={{ r: 3, fill: "white", strokeWidth: 2 }} />)}</LineChart></ResponsiveContainer> : <div className="grid h-full place-items-center rounded-lg bg-[#f8fafb] text-sm text-[#80878b]">Nenhum check-in compartilhado por este paciente.</div>}</div></section>
        <div className="mt-7 grid gap-4 sm:grid-cols-2"><article className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-5"><div className="flex gap-3"><Info className="h-5 w-5 shrink-0 text-[#2563eb]" /><div><b className="text-sm">Síntese descritiva</b><p className="mt-1 text-sm leading-relaxed text-[#70777b]">Os valores devem ser interpretados junto ao contexto narrado pelo paciente e à avaliação clínica.</p></div></div></article><article className="rounded-lg border border-[#dbeafe] bg-white p-5"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[#2563eb]" /><div><b className="text-sm">Limite clínico</b><p className="mt-1 text-sm leading-relaxed text-[#70777b]">Este relatório não oferece diagnóstico, prognóstico ou recomendação automatizada.</p></div></div></article></div>
      </div>
    </article>
  </div></PsychologistLayout>

  return <PsychologistLayout><div className="mx-auto max-w-6xl">
    <header className="mb-7"><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-[#2563eb]">Análise longitudinal</span><h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Relatórios individuais</h1><p className="mt-2 text-[#687074]">Escolha uma pessoa e analise somente os registros autorizados dela.</p></header>
    <section className="mb-5 rounded-lg border border-black/5 bg-white p-6 shadow-[0_2px_5px_rgba(31,42,46,.14)]"><label className="mb-3 block text-sm font-bold text-[#2f3539]">Paciente vinculado</label><div className="flex flex-col gap-3 sm:flex-row"><Select value={resolvedPatientId} onValueChange={setSelectedPatient}><SelectTrigger className="flex-1"><SelectValue /></SelectTrigger><SelectContent>{patients.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select><button onClick={() => setViewing(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white"><Eye className="h-4 w-4" /> Visualizar relatório</button><button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d7dde0] px-5 py-2.5 text-sm font-bold text-[#57534e]"><Download className="h-4 w-4" /> Baixar</button></div></section>
    <div className="mb-5 grid gap-3 sm:grid-cols-4">{[["Humor médio", avg("mood")], ["Energia média", avg("energyLevel")], ["Sono médio", avg("sleepQuality")], ["Registros", String(entries.length)]].map(([label, value]) => <article key={label} className="rounded-lg border border-black/5 bg-white p-5"><b className="block text-2xl text-[#1f2427]">{value}{label !== "Registros" && value !== "—" && <small className="text-sm text-[#89847e]">/5</small>}</b><span className="text-sm text-[#70777b]">{label}</span></article>)}</div>
    <section className="rounded-lg border border-black/5 bg-white p-6"><div className="mb-4 flex items-center gap-3"><FileText className="h-5 w-5 text-[#2563eb]" /><div><h2 className="font-bold text-[#1f2427]">Relatórios anteriores</h2><p className="text-sm text-[#70777b]">Histórico semanal de {patient.name}</p></div></div>{reportPeriods.map((period, index) => <div key={period} className="flex items-center justify-between border-t border-[#e5e9eb] py-4"><div className="flex items-center gap-3"><CalendarDays className="h-4 w-4 text-[#94a3b8]" /><div><b className="block text-sm">Relatório semanal</b><small className="text-[#80878b]">{period}</small></div></div><button onClick={() => setViewing(true)} className="text-sm font-bold text-[#2563eb]">{index === 0 ? "Atual" : "Abrir"}</button></div>)}</section>
  </div></PsychologistLayout>
}


