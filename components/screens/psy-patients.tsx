"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { PsychologistLayout } from "./psychologist-layout"
import { useNavigation } from "@/lib/navigation"
import type { Patient } from "@/lib/store"
import { usePilot } from "@/lib/pilot-context"
import { formatCalendarDate } from "@/lib/date"
import { Search, Plus, Phone, Mail, Calendar, FileText, Send, Trash2 } from "lucide-react"

export function PsyPatients() {
  const { navigate } = useNavigation()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [patientToRemove, setPatientToRemove] = useState<Patient | null>(null)
  const { patients, invites, createInvite, archivePatient } = usePilot()
  const submitInvite = () => { if (!inviteName.trim() || !inviteEmail.trim()) return; void createInvite(inviteName.trim(), inviteEmail.trim()); setInviteName(""); setInviteEmail(""); setShowAddDialog(false) }

  const filtered = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "todos" || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const confirmRemovePatient = async () => {
    if (!patientToRemove) return
    await archivePatient(patientToRemove.id)
    setPatientToRemove(null)
  }

  const statusStyle = (status: string) => {
    if (status === "ativo")   return { bg: "rgba(34,197,94,0.12)",  color: "#16a34a" }
    if (status === "pausado") return { bg: "rgba(99,102,241,0.12)", color: "#4f46e5" }
    return { bg: "rgba(156,163,175,0.15)", color: "#6b7280" }
  }

  return (
    <PsychologistLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#1f2427" }}>Controle de Pacientes</h1>
            <p className="text-sm" style={{ color: "#687074" }}>Gerencie todos os seus pacientes</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#2563eb" }}
              >
                <Plus className="h-4 w-4" />
                Convidar paciente
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar paciente para o piloto</DialogTitle>
                <DialogDescription>O piloto registra o convite, mas não envia um e-mail real.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2"><Label>Nome completo</Label><Input value={inviteName} onChange={(event) => setInviteName(event.target.value)} placeholder="Nome do paciente" /></div>
                <div className="flex flex-col gap-2"><Label>E-mail</Label><Input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} type="email" placeholder="email@exemplo.com" /></div>
                <div className="rounded-lg bg-[#eff6ff] p-3 text-xs leading-relaxed text-[#64748b]">A pessoa verá o consentimento informado e as regras de privacidade antes do primeiro acesso.</div>
                <button
                  onClick={submitInvite}
                  disabled={!inviteName.trim() || !inviteEmail.trim()}
                  className="mt-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  Criar convite demonstrativo
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {invites.some((invite) => invite.status === "pendente") && <section className="mb-6 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-[#2563eb]"><Send className="h-4 w-4" /></span><div><b className="block text-sm text-[#2f3539]">{invites.filter((invite) => invite.status === "pendente").length} convite aguardando aceite</b><small className="text-[#64748b]">{invites.filter((invite) => invite.status === "pendente").map((invite) => invite.email).join(", ")}</small></div></div><button onClick={() => navigate("psy-follow-up")} className="text-xs font-bold text-[#1d4ed8]">Gerenciar convites →</button></div></section>}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#90979b" }} />
            <Input
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="pausado">Pausados</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((patient) => {
            const st = statusStyle(patient.status)
            return (
              <div key={patient.id} className="rounded-lg bg-white p-5 shadow-sm border border-border transition-all hover:shadow-md">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: "#2563eb" }}
                    >
                      {patient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#1f2427" }}>{patient.name}</p>
                      <p className="text-xs" style={{ color: "#687074" }}>{patient.age} anos</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                    {patient.status}
                  </span>
                </div>
                <div className="mb-4 flex flex-col gap-1.5 text-xs" style={{ color: "#687074" }}>
                  <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {patient.email}</span>
                  <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {patient.phone}</span>
                  <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Última sessão: {formatCalendarDate(patient.lastSession)}</span>
                </div>
                {patient.diagnosis && (
                  <p className="mb-3 text-xs" style={{ color: "#1f2427" }}>
                    <span className="font-semibold">Diagnóstico:</span> {patient.diagnosis}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("psy-patient-detail", { patientId: patient.id })}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ borderColor: "#2563eb", color: "#2563eb" }}
                  >
                    <FileText className="h-3.5 w-3.5" /> Detalhes
                  </button>
                  <button
                    onClick={() => navigate("psy-reports", { patientId: patient.id })}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ borderColor: "#e0e0e8", color: "#687074" }}
                  >
                    Relatório
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientToRemove(patient)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                    aria-label={`Remover ${patient.name}`}
                    title="Remover paciente"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <AlertDialog open={Boolean(patientToRemove)} onOpenChange={(open) => { if (!open) setPatientToRemove(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar vínculo com paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              O vínculo com {patientToRemove?.name} será encerrado e sairá da lista ativa. Os registros serão preservados para rastreabilidade e não aparecerão em novos acompanhamentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmRemovePatient()} className="bg-red-600 text-white hover:bg-red-700">Encerrar vínculo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PsychologistLayout>
  )
}

