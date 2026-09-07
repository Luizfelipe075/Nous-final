"use client"

import { useState } from "react"
import { PatientLayout } from "./patient-layout"
import { usePilot } from "@/lib/pilot-context"
import { useAuth } from "@/lib/auth-context"
import { Switch } from "@/components/ui/switch"
import { Check, Download, FileLock2, Info, ShieldCheck, Trash2 } from "lucide-react"

export function PatientPrivacy() {
  const { consent, updateConsent, exportPatientData } = usePilot()
  const { user } = useAuth()
  const [requestSent, setRequestSent] = useState(false)
  return <PatientLayout><div className="mx-auto max-w-5xl">
    <header className="mb-7"><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-[#ff7100]">Seus dados, suas escolhas</span><h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Privacidade e preferências</h1><p className="mt-2 max-w-2xl text-[#687074]">Controle o compartilhamento dos seus registros. O diário só é disponibilizado à psicóloga quando você escolher.</p></header>
    {requestSent && <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><Check className="h-4 w-4" /> Solicitação registrada para análise.</div>}
    <div className="grid gap-5 lg:grid-cols-[1fr_.75fr]">
      <section className="rounded-lg border border-black/5 bg-white p-6 shadow-[0_2px_5px_rgba(31,42,46,.12)]"><div className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-[#fff0e4] p-2 text-[#ff7100]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-bold text-[#1f2427]">Consentimento e compartilhamento</h2><p className="text-sm text-[#70777b]">Preferências desta demonstração.</p></div></div><div className="space-y-3"><Preference title="Compartilhar check-ins" text="Humor, energia, sono, ansiedade e contexto breve." checked={consent.shareCheckins} onChange={(checked) => updateConsent({ shareCheckins: checked })} /><Preference title="Permitir escolha no diário" text="Cada reflexão pode ser privada ou compartilhada por você." checked={consent.shareDiaryByChoice} onChange={(checked) => updateConsent({ shareDiaryByChoice: checked })} /></div><div className="mt-5 flex gap-3 rounded-lg bg-[#fff8f3] p-4 text-xs leading-relaxed text-[#706963]"><Info className="h-4 w-4 shrink-0 text-[#ff7100]" /> Alterar uma preferência não apaga registros anteriores. Solicitações de correção ou exclusão precisam de confirmação e análise responsável.</div></section>
      <aside className="space-y-5"><section className="rounded-lg border border-black/5 bg-white p-5"><FileLock2 className="mb-4 h-5 w-5 text-[#ff7100]" /><h2 className="font-bold text-[#1f2427]">Portabilidade</h2><p className="mt-2 text-sm leading-relaxed text-[#70777b]">Baixe uma cópia demonstrativa das suas atividades, diário, configurações e registros acessíveis.</p><button onClick={() => user && exportPatientData(user.id)} disabled={!user} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#ff7100] px-4 py-2.5 text-sm font-bold text-[#e86600] disabled:opacity-40"><Download className="h-4 w-4" /> Exportar meus dados</button></section><section className="rounded-lg border border-red-100 bg-red-50/40 p-5"><Trash2 className="mb-4 h-5 w-5 text-red-600" /><h2 className="font-bold text-[#1f2427]">Correção ou exclusão</h2><p className="mt-2 text-sm leading-relaxed text-[#70777b]">Abra uma solicitação para revisar, corrigir ou excluir informações quando aplicável.</p><button onClick={() => setRequestSent(true)} className="mt-5 w-full rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700">Solicitar atendimento</button></section></aside>
    </div>
  </div></PatientLayout>
}

function Preference({ title, text, checked, onChange }: { title: string; text: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border border-[#e2e7e9] p-4"><div><b className="block text-sm text-[#2f3539]">{title}</b><small className="text-[#777e82]">{text}</small></div><Switch checked={checked} onCheckedChange={onChange} /></div>
}
