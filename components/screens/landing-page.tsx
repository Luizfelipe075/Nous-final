"use client"

import { useNavigation } from "@/lib/navigation"
import { BarChart3, BookOpen, CheckCircle2, Heart, Headphones, Users, Compass, ShieldCheck, FileText } from "lucide-react"
import { NousLogo } from "@/components/ui/nous-logo"

const features = [
  { icon: <Heart className="h-5 w-5" />, audience: "patient", title: "Check-ins rápidos", description: "Energia, sono, ansiedade e contexto em uma escala Likert consistente." },
  { icon: <BarChart3 className="h-5 w-5" />, audience: "psychologist", title: "Resumo pré-sessão", description: "Entenda o que mudou durante a semana antes de iniciar a conversa." },
  { icon: <Users className="h-5 w-5" />, audience: "psychologist", title: "Tarefas terapêuticas", description: "Combine atividades e acompanhe a realização entre as sessões." },
  { icon: <BookOpen className="h-5 w-5" />, audience: "patient", title: "Linha do tempo", description: "Check-ins, diário compartilhado e tarefas organizados por paciente." },
  { icon: <Headphones className="h-5 w-5" />, audience: "psychologist", title: "Privacidade e Segurança", description: "Dados individuais tratados com cuidado e acesso responsável." },
]

export function LandingPage() {
  const { navigate } = useNavigation()

  return (
    <div className="min-h-screen bg-white text-[#171b1e]">
      <header className="border-b border-[#e6eaec] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-7">
          <NousLogo height={31} />
          <button onClick={() => navigate("login")} className="rounded-lg bg-[#243447] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#162436]">Entrar</button>
        </div>
      </header>

      <main>
        <section className="border-b border-[#e8ebec] bg-[linear-gradient(180deg,#ffffff_0%,#fff_85%,#f7f1ee_100%)] px-5 py-14 sm:px-7 lg:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_.75fr]">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f0e7e0] bg-white px-3 py-1.5 text-xs font-medium text-[#687074] shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#ff7100]" /> Apoio inteligente para o acompanhamento psicológico
              </span>
              <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Entenda a semana do paciente <span className="text-[#ff7100]">antes da sessão</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#62696d] sm:text-lg">
                O NOUS organiza check-ins, tarefas e registros entre as sessões para o psicólogo chegar à conversa com contexto — sem depender da memória ou de mensagens espalhadas.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => navigate("login", { role: "paciente" })} className="rounded-lg bg-[#ff7100] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e96800]">Sou paciente</button>
                <button onClick={() => navigate("login", { role: "psicologo" })} className="rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">Sou psicólogo</button>
                <a href="#recursos" className="rounded-lg border border-[#cfd5d8] bg-white px-6 py-3 text-sm font-semibold text-[#363c40] transition hover:border-[#64748b]">Conheça a plataforma</a>
              </div>
            </div>
            <div className="mx-auto flex w-full max-w-sm items-center justify-center lg:justify-end">
              <img src="/icon.svg" alt="" className="h-auto w-full max-w-[330px] drop-shadow-[0_18px_28px_rgba(26,42,48,.10)]" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="border-b border-[#e6eaec] bg-white px-5 py-10 sm:px-7">
          <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_.85fr]">
            <div className="rounded-xl border border-[#dbe5f2] bg-[#f7faff] p-6">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-white p-2 text-[#2563eb]"><Compass className="h-5 w-5" /></span>
                <div>
                  <h2 className="font-bold">Um guia para a sessão, não um substituto</h2>
                  <p className="mt-2 text-sm leading-6 text-[#5f686c]">O Noûs ajuda paciente e psicólogo a registrar acontecimentos, combinar atividades, lembrar horários e chegar à sessão com pontos de conversa organizados. A interpretação e as decisões continuam na relação profissional.</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#e2e7e9] bg-[#fafbfb] p-6">
              <div className="flex items-start gap-3">
                <span className="rounded-lg bg-white p-2 text-[#687074]"><ShieldCheck className="h-5 w-5" /></span>
                <div>
                  <h2 className="font-bold">Transparência desde a entrada</h2>
                  <p className="mt-2 text-sm leading-6 text-[#687074]">Consulte como o protótipo trata privacidade e como a plataforma deve ser usada.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button onClick={() => navigate("privacy")} className="inline-flex items-center gap-2 rounded-lg border border-[#d7dde0] bg-white px-3 py-2 text-xs font-bold text-[#4f565a]"><ShieldCheck className="h-3.5 w-3.5" /> Política de privacidade</button>
                    <button onClick={() => navigate("terms")} className="inline-flex items-center gap-2 rounded-lg border border-[#d7dde0] bg-white px-3 py-2 text-xs font-bold text-[#4f565a]"><FileText className="h-3.5 w-3.5" /> Termos de uso</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recursos" className="bg-[#f7f4f3] px-5 py-14 sm:px-7 lg:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-9 max-w-xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">O período entre sessões, finalmente organizado</h2>
              <p className="mt-2 text-sm leading-6 text-[#6a7175]">Um fluxo simples para registrar, acompanhar e preparar a próxima conversa sem transformar indicadores em diagnóstico.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-lg border border-[#dce2e4] bg-white p-5 shadow-[0_2px_5px_rgba(31,42,46,.12)]">
                  <span className={`mb-4 grid h-10 w-10 place-items-center rounded-lg ${feature.audience === "patient" ? "bg-[#fff0e4] text-[#ff7100]" : "bg-[#eff6ff] text-[#2563eb]"}`}>{feature.icon}</span>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#70777b]">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f4f3] px-5 pb-14 sm:px-7 lg:pb-16">
          <div className="mx-auto max-w-3xl rounded-lg border border-[#d9dfe1] bg-white px-6 py-9 text-center shadow-[0_2px_5px_rgba(31,42,46,.12)]">
            <h2 className="text-xl font-bold">Pronto para transformar seu acompanhamento terapêutico?</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6d7478]">Junte-se a uma experiência mais organizada, clara e próxima para profissionais e pacientes.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate("login", { role: "paciente" })} className="rounded-lg bg-[#ff7100] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e96800]">Sou paciente</button>
              <button onClick={() => navigate("login", { role: "psicologo" })} className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]">Sou psicólogo</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e3e7e9] bg-white px-5 py-6 sm:px-7">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <NousLogo height={25} />
          <div className="flex flex-wrap items-center justify-center gap-4 text-center text-[11px] text-[#7b8286]"><p>Noûs não substitui o acompanhamento profissional. É uma ferramenta de apoio ao psicólogo.</p><button onClick={() => navigate("privacy")} className="font-semibold hover:text-[#2563eb]">Privacidade</button><button onClick={() => navigate("terms")} className="font-semibold hover:text-[#2563eb]">Termos de uso</button></div>
        </div>
      </footer>
    </div>
  )
}
