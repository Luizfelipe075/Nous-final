"use client"

import { useState } from "react"
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NousLogo } from "@/components/ui/nous-logo"
import { useNavigation } from "@/lib/navigation"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/store"

const demoCredentials: Record<UserRole, { email: string; password: string }> = {
  paciente: { email: "paciente@demo.nous", password: "NousPaciente2026!" },
  psicologo: { email: "psicologo@demo.nous", password: "NousPsicologo2026!" },
}

export function LoginScreen() {
  const { navigate, params } = useNavigation()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [tab, setTab] = useState<UserRole>(params.role === "psicologo" ? "psicologo" : "paciente")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const isPsychologist = tab === "psicologo"
  const accentText = isPsychologist ? "text-[#2563eb]" : "text-[#e86600]"
  const accentButton = isPsychologist ? "bg-[#2563eb] hover:bg-[#1d4ed8]" : "bg-[#ff7100] hover:bg-[#e96800]"

  const selectRole = (role: UserRole) => {
    setTab(role)
    setEmail("")
    setPassword("")
    setError("")
  }

  const fillDemoAccess = () => {
    setEmail(demoCredentials[tab].email)
    setPassword(demoCredentials[tab].password)
    setError("")
  }

  const handleLogin = async () => {
    setSubmitting(true)
    setError("")
    const result = await login(email, password, tab)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error || "Não foi possível entrar.")
      return
    }
    navigate(tab === "psicologo" ? "psy-dashboard" : "patient-dashboard")
  }

  return (
    <div className={`relative flex min-h-screen flex-col ${isPsychologist ? "bg-[#f7faff]" : "bg-[#fffaf7]"}`}>
      <button type="button" onClick={() => navigate("landing")} className={`absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 text-xs font-medium text-[#687074] sm:left-8 sm:top-7 ${isPsychologist ? "hover:text-[#2563eb]" : "hover:text-[#ff7100]"}`}>
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </button>

      <main className="flex flex-1 items-center justify-center px-5 py-20">
        <section className="w-full max-w-[410px] rounded-lg border border-[#d9dfe1] bg-white px-7 py-8 shadow-[0_2px_5px_rgba(31,42,46,.18)] sm:px-8">
          <div className="mb-5 flex flex-col items-center text-center">
            <NousLogo height={44} className={isPsychologist ? "psychologist-logo" : undefined} />
            <h1 className="mt-4 text-xl font-bold text-[#1a1e21]">Bem-vindo ao Noûs</h1>
            <p className="mt-1 text-xs text-[#777e82]">Escolha seu perfil e use o acesso seguro de demonstração.</p>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-lg bg-[#eef1f4] p-1" aria-label="Escolher perfil de acesso">
            {(["paciente", "psicologo"] as const).map((role) => (
              <button
                key={role}
                type="button"
                aria-pressed={tab === role}
                onClick={() => selectRole(role)}
                className={`rounded-md py-2 text-xs font-semibold transition ${tab === role ? role === "paciente" ? "bg-[#fff3e8] text-[#d95f00] shadow-sm" : "bg-[#eff6ff] text-[#2563eb] shadow-sm" : "text-[#666d71] hover:text-[#30363a]"}`}
              >
                {role === "paciente" ? "Paciente" : "Psicólogo"}
              </button>
            ))}
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void handleLogin() }} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-[#2e3438]">E-mail</Label>
              <Input id="email" required type="email" autoComplete="username" placeholder={isPsychologist ? "seu@clinica.com" : "seu@email.com"} value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 rounded-md bg-white text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-[#2e3438]">Senha</Label>
              <div className="relative">
                <Input id="password" required minLength={8} autoComplete="current-password" type={showPassword ? "text" : "password"} placeholder="Sua senha" value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 rounded-md bg-white pr-10 text-sm" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737a7e]" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>}

            <button type="button" onClick={fillDemoAccess} className={`inline-flex w-full items-center justify-center gap-2 rounded-md border py-2.5 text-xs font-semibold ${isPsychologist ? "border-blue-200 bg-blue-50 text-blue-700" : "border-orange-200 bg-orange-50 text-orange-700"}`}>
              <ShieldCheck className="h-3.5 w-3.5" /> Preencher acesso demonstrativo
            </button>
            <button type="submit" disabled={submitting} className={`w-full rounded-md py-2.5 text-xs font-semibold text-white transition disabled:opacity-50 ${accentButton}`}>
              {submitting ? "Entrando…" : "Entrar"}
            </button>
            <div className="flex items-start gap-2 rounded-lg bg-[#f5f7f7] p-3 text-[10px] leading-relaxed text-[#777e82]">
              <LockKeyhole className={`h-3.5 w-3.5 shrink-0 ${accentText}`} />
              A senha é validada no servidor e a sessão usa cookie protegido. Este ambiente contém somente dados fictícios.
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

