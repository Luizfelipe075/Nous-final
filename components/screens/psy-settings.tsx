"use client"

import { useState } from "react"
import { PsychologistLayout } from "./psychologist-layout"
import { usePilot } from "@/lib/pilot-context"
import { Switch } from "@/components/ui/switch"
import { Check, Database, Download, KeyRound, LockKeyhole, MonitorSmartphone, ShieldCheck } from "lucide-react"

export function PsySettings() {
  const { twoFactorEnabled, setTwoFactorEnabled, audit } = usePilot()
  const [saved, setSaved] = useState(false)
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2400) }

  return <PsychologistLayout><div className="mx-auto max-w-6xl">
    <header className="mb-7"><span className="mb-2 block text-xs font-bold uppercase tracking-[.18em] text-[#2563eb]">Conta profissional</span><h1 className="text-3xl font-bold tracking-tight text-[#1f2427]">Segurança e privacidade</h1><p className="mt-2 max-w-2xl text-[#687074]">Controles demonstrativos do piloto. A infraestrutura de produção deverá aplicar essas regras no servidor.</p></header>
    {saved && <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><Check className="h-4 w-4" /> Preferências salvas.</div>}
    <div className="grid gap-5 lg:grid-cols-[1fr_.9fr]">
      <div className="space-y-5">
        <section className="rounded-lg border border-black/5 bg-white p-6 shadow-[0_2px_5px_rgba(31,42,46,.12)]"><div className="mb-5 flex items-center gap-3"><span className="rounded-lg bg-[#eff6ff] p-2 text-[#2563eb]"><KeyRound className="h-5 w-5" /></span><div><h2 className="font-bold text-[#1f2427]">Proteção da conta</h2><p className="text-sm text-[#70777b]">Reduza o risco de acesso indevido.</p></div></div><div className="flex items-center justify-between rounded-lg border border-[#e2e7e9] p-4"><div><b className="block text-sm">Autenticação em duas etapas</b><small className="text-[#777e82]">Solicita um código adicional no login profissional.</small></div><Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} /></div><div className="mt-3 flex items-center justify-between rounded-lg border border-[#e2e7e9] p-4"><div><b className="block text-sm">Sessão atual</b><small className="text-[#777e82]">Windows · acesso realizado hoje às 08:42</small></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Ativa</span></div><button onClick={save} className="mt-5 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white">Salvar segurança</button></section>
        <section className="rounded-lg border border-black/5 bg-white p-6"><div className="mb-5 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#2563eb]" /><div><h2 className="font-bold text-[#1f2427]">Controles previstos para produção</h2><p className="text-sm text-[#70777b]">Itens necessários antes de disponibilizar dados reais.</p></div></div><div className="grid gap-3 sm:grid-cols-2">{[{ icon: <LockKeyhole />, title: "Criptografia", text: "Trânsito e armazenamento protegidos" }, { icon: <Database />, title: "Isolamento", text: "Dados separados por consultório" }, { icon: <MonitorSmartphone />, title: "Sessões", text: "Expiração e revogação de acessos" }, { icon: <Download />, title: "Backups", text: "Rotina testada de recuperação" }].map((item) => <article key={item.title} className="rounded-lg bg-[#f6f8f8] p-4"><span className="text-[#2563eb] [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span><b className="mt-3 block text-sm">{item.title}</b><p className="mt-1 text-xs text-[#777e82]">{item.text}</p></article>)}</div></section>
      </div>
      <aside className="rounded-lg border border-black/5 bg-white p-6 shadow-[0_2px_5px_rgba(31,42,46,.12)]"><div className="mb-5"><h2 className="font-bold text-[#1f2427]">Trilha de auditoria</h2><p className="text-sm text-[#70777b]">Registro de ações sensíveis nesta demonstração.</p></div><div className="relative space-y-0 before:absolute before:bottom-4 before:left-[7px] before:top-3 before:w-px before:bg-[#e1e6e8]">{audit.slice(0,10).map((event) => <article key={event.id} className="relative pb-5 pl-7"><span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white bg-[#2563eb] shadow-sm" /><div className="flex flex-col justify-between gap-1 sm:flex-row"><b className="text-sm text-[#2f3539]">{event.action}</b><time className="text-[10px] text-[#90979b]">{new Date(event.at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time></div><p className="mt-1 text-xs leading-relaxed text-[#737a7e]">{event.detail}</p></article>)}</div></aside>
    </div>
  </div></PsychologistLayout>
}

