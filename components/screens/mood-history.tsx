"use client"

import { useState } from "react"
import { PatientLayout } from "./patient-layout"
import { useCheckins } from "@/lib/use-checkins"
import { useNavigation } from "@/lib/navigation"
import { usePilot, type DiaryVisibility } from "@/lib/pilot-context"
import { useAuth } from "@/lib/auth-context"
import type { MoodEntry } from "@/lib/store"
import { likertLabel } from "@/lib/likert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, BookHeart, CalendarDays, Eye, EyeOff, Info } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const series = [
  { key: "humor", label: "Humor", color: "#ff7100" },
  { key: "energia", label: "Energia", color: "#0f766e" },
  { key: "sono", label: "Sono", color: "#2563a5" },
  { key: "ansiedade", label: "Ansiedade", color: "#a16207" },
]

type DiaryFilter = "todos" | DiaryVisibility

const diaryFilterLabel: Record<DiaryFilter, string> = {
  todos: "Todos",
  privado: "Somente eu",
  compartilhado: "Compartilhados",
}

export function MoodHistory() {
  const { params } = useNavigation()
  const { user } = useAuth()
  const patientId = user?.id || ""
  const { entries } = useCheckins(patientId)
  const { diary } = usePilot()
  const [diaryFilter, setDiaryFilter] = useState<DiaryFilter>("todos")
  const [selectedCheckin, setSelectedCheckin] = useState<MoodEntry | null>(null)
  const chartData = [...entries].slice(0, 14).reverse().map((entry) => ({
    date: entry.date.includes("-") ? entry.date.split("-").slice(1).reverse().join("/") : entry.date,
    humor: entry.mood,
    energia: entry.energyLevel,
    sono: entry.sleepQuality,
    ansiedade: entry.anxietyLevel,
  }))
  const patientDiary = diary
    .filter((entry) => entry.patientId === patientId && (diaryFilter === "todos" || entry.visibility === diaryFilter))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <PatientLayout>
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Histórico</h1>
          <p className="mt-2 max-w-2xl text-[#687074]">Consulte seus check-ins e as reflexões registradas no diário de emoções.</p>
        </header>

        <Tabs defaultValue={params.tab === "diarios" ? "diarios" : "checkins"} className="gap-5">
          <TabsList className="h-auto w-full justify-start rounded-lg border border-[#e2e7e9] bg-white p-1 sm:w-fit">
            <TabsTrigger value="checkins" className="flex-1 gap-2 px-4 py-2 sm:flex-none"><CalendarDays className="h-4 w-4" /> Check-ins</TabsTrigger>
            <TabsTrigger value="diarios" className="flex-1 gap-2 px-4 py-2 sm:flex-none"><BookHeart className="h-4 w-4" /> Diários de emoções</TabsTrigger>
          </TabsList>

          <TabsContent value="checkins" className="space-y-7">
            <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.14)] sm:p-7">
              <div className="mb-5 flex flex-wrap gap-4">
                {series.map((item) => <span key={item.key} className="flex items-center gap-2 text-xs font-semibold text-[#696661]"><i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.label}</span>)}
              </div>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e8ecee" />
                    <XAxis dataKey="date" tick={{ fill: "#80878b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "#80878b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value, name) => [`${value}/5 · ${likertLabel(Number(value))}`, series.find((item) => item.key === name)?.label || name]} contentStyle={{ borderRadius: 14, border: "1px solid #dfe4e6" }} />
                    {series.map((item) => <Line key={item.key} type="monotone" dataKey={item.key} name={item.key} stroke={item.color} strokeWidth={2.5} dot={{ r: 3, fill: "white", strokeWidth: 2 }} />)}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#f5f7f7] p-3 text-xs text-[#716c66]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#ff7100]" />1 significa muito baixo; 3, moderado; e 5, muito alto. Para ansiedade, um valor maior indica maior ansiedade percebida.</div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-bold text-[#1f2427]">Registros recentes</h2>
              <div className="space-y-3">
                {entries.map((entry) => <article key={entry.id} className="overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm transition hover:border-[#ffc798] hover:shadow-md"><button type="button" onClick={() => setSelectedCheckin(entry)} className="group w-full p-5 text-left"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="rounded-lg bg-[#fff0e4] p-2 text-[#ff7100]"><CalendarDays className="h-4 w-4" /></span><div><b className="block text-sm text-[#1f2427]">{new Date(`${entry.date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</b>{entry.note && <p className="mt-1 line-clamp-1 text-sm text-[#70777b]">{entry.note}</p>}</div></div><div className="flex flex-wrap items-center gap-2">{[["Humor", entry.mood], ["Energia", entry.energyLevel], ["Sono", entry.sleepQuality], ["Ansiedade", entry.anxietyLevel]].map(([label, value]) => <span key={label as string} className="rounded-full border border-[#dfe4e6] bg-[#faf8f5] px-3 py-1 text-xs text-[#64605b]"><b>{label}</b> {value}/5</span>)}<span className="ml-1 inline-flex items-center gap-1 text-xs font-bold text-[#e86600]">Abrir registro <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div></div></button></article>)}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="diarios">
            <section className="rounded-lg border border-black/5 bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)] sm:p-7">
              <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><h2 className="font-bold text-[#1f2427]">Diários de emoções</h2><p className="mt-1 text-sm text-[#70777b]">Veja o que ficou privado e o que foi compartilhado com sua psicóloga.</p></div>
                <div className="flex flex-wrap gap-2" aria-label="Filtrar diários por compartilhamento">
                  {(Object.keys(diaryFilterLabel) as DiaryFilter[]).map((filter) => <button key={filter} type="button" onClick={() => setDiaryFilter(filter)} aria-pressed={diaryFilter === filter} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${diaryFilter === filter ? "border-[#ff7100] bg-[#fff0e4] text-[#d95f00]" : "border-[#dfe4e6] text-[#687074] hover:border-[#ffc798]"}`}>{diaryFilterLabel[filter]}</button>)}
                </div>
              </div>

              {patientDiary.length ? <div className="space-y-4">{patientDiary.map((entry) => {
                const shared = entry.visibility === "compartilhado"
                return <article key={entry.id} className="rounded-lg border border-[#e2e7e9] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="flex items-start gap-3"><span className={`rounded-lg p-2 ${shared ? "bg-blue-50 text-blue-600" : "bg-[#fff0e4] text-[#ff7100]"}`}>{shared ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#1f2427]">{entry.emotion}</h3><span className="rounded-full bg-[#f3f5f5] px-2 py-0.5 text-[10px] font-bold text-[#687074]">Intensidade {entry.intensity}/5</span></div><time className="mt-1 block text-xs text-[#8a9195]">{new Date(entry.date).toLocaleString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div></div><span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${shared ? "bg-blue-50 text-blue-700" : "bg-[#fff0e4] text-[#d95f00]"}`}>{shared ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{shared ? "Compartilhado com a psicóloga" : "Somente eu"}</span></div><p className="mt-4 text-sm leading-relaxed text-[#596165]">{entry.context}</p>{(entry.body || entry.strategy) && <div className="mt-4 grid gap-3 sm:grid-cols-2">{entry.body && <div className="rounded-lg bg-[#f6f8f8] p-3"><b className="text-xs text-[#3f474b]">Sinais no corpo</b><p className="mt-1 text-xs leading-relaxed text-[#70777b]">{entry.body}</p></div>}{entry.strategy && <div className="rounded-lg bg-[#f6f8f8] p-3"><b className="text-xs text-[#3f474b]">O que ajudou</b><p className="mt-1 text-xs leading-relaxed text-[#70777b]">{entry.strategy}</p></div>}</div>}</article>
              })}</div> : <div className="rounded-lg border border-dashed border-[#d7dde0] px-5 py-10 text-center"><BookHeart className="mx-auto h-7 w-7 text-[#b1b7ba]" /><b className="mt-3 block text-sm text-[#4f565a]">Nenhum diário neste filtro</b><p className="mt-1 text-xs text-[#80878b]">Altere o filtro para consultar outras reflexões.</p></div>}
            </section>
          </TabsContent>
        </Tabs>

        <Dialog open={Boolean(selectedCheckin)} onOpenChange={(open) => { if (!open) setSelectedCheckin(null) }}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Detalhes do check-in</DialogTitle>
              <DialogDescription>{selectedCheckin ? new Date(`${selectedCheckin.date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "Registro recente"}</DialogDescription>
            </DialogHeader>
            {selectedCheckin && <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[["Humor", selectedCheckin.mood], ["Energia", selectedCheckin.energyLevel], ["Sono", selectedCheckin.sleepQuality], ["Ansiedade", selectedCheckin.anxietyLevel]].map(([label, value]) => <article key={label as string} className="rounded-lg border border-[#f1d8c3] bg-[#fff8f3] p-3"><small className="text-[#777e82]">{label}</small><b className="mt-1 block text-xl text-[#1f2427]">{value}/5</b><span className="text-[10px] font-bold text-[#e86600]">{likertLabel(Number(value))}</span></article>)}
              </div>
              <section><h3 className="text-sm font-bold text-[#1f2427]">Contexto registrado</h3><p className="mt-2 rounded-lg bg-[#f6f8f8] p-4 text-sm leading-relaxed text-[#656d71]">{selectedCheckin.note || "Nenhum contexto adicional foi preenchido neste check-in."}</p></section>
              <section><h3 className="text-sm font-bold text-[#1f2427]">Atividades presentes no dia</h3>{selectedCheckin.activities.length ? <div className="mt-2 flex flex-wrap gap-2">{selectedCheckin.activities.map((activity) => <span key={activity} className="rounded-full border border-[#f1d8c3] bg-[#fff8f3] px-3 py-1.5 text-xs font-semibold text-[#d95f00]">{activity}</span>)}</div> : <p className="mt-2 text-sm text-[#80878b]">Nenhuma atividade foi selecionada.</p>}</section>
              <div className="flex items-start gap-2 rounded-lg border border-[#f1d8c3] bg-[#fffaf7] p-3 text-xs leading-relaxed text-[#706963]"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#ff7100]" />Este é o conteúdo preenchido pelo paciente no momento do check-in.</div>
            </div>}
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  )
}
