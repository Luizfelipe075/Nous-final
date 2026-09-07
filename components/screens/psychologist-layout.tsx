"use client"

import { useEffect } from "react"
import { useNavigation, type Screen } from "@/lib/navigation"
import { useAuth } from "@/lib/auth-context"
import { ClipboardList, FileText, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"
import { NousLogo } from "@/components/ui/nous-logo"

const navigation: { screen: Screen; label: string; short: string; icon: React.ReactNode }[] = [
  { screen: "psy-dashboard", label: "Dashboard", short: "Início", icon: <LayoutDashboard className="h-4 w-4" /> },
  { screen: "psy-patients", label: "Pacientes", short: "Pacientes", icon: <Users className="h-4 w-4" /> },
  { screen: "psy-follow-up", label: "Acompanhamento", short: "Acompanhar", icon: <ClipboardList className="h-4 w-4" /> },
  { screen: "psy-reports", label: "Relatórios", short: "Relatórios", icon: <FileText className="h-4 w-4" /> },
]

export function PsychologistLayout({ children }: { children: React.ReactNode }) {
  const { screen, navigate } = useNavigation()
  const { user, logout } = useAuth()
  const signOut = async () => { await logout(); navigate("landing") }

  useEffect(() => {
    document.body.classList.add("psychologist-theme")
    return () => document.body.classList.remove("psychologist-theme")
  }, [])

  return (
    <div className="portal-psychologist min-h-screen bg-[#f8fafb] lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="hidden min-h-screen flex-col border-r border-[#e2e7e9] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="px-5 pb-6 pt-5"><NousLogo height={29} className="psychologist-logo" /></div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navigation.map((item) => {
            const active = screen === item.screen
            return (
              <button
                key={item.screen}
                onClick={() => navigate(item.screen)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? "bg-[#dbeafe] text-[#1d4ed8]" : "text-[#4f565a] hover:bg-[#eff6ff] hover:text-[#1d4ed8]"}`}
              >
                <span className={active ? "text-[#2563eb]" : "text-[#71787c]"}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#e2e7e9] bg-white/95 px-4 backdrop-blur lg:px-7">
          <div className="lg:hidden"><NousLogo height={27} className="psychologist-logo" /></div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("psy-settings")} aria-label="Configurações e segurança" className="rounded-lg p-2 text-[#747b7f] hover:bg-[#eff6ff] hover:text-[#2563eb]"><Settings className="h-4 w-4" /></button>
            <span className="hidden text-xs font-medium text-[#535a5e] sm:block">{user?.name}</span>
            <button onClick={() => void signOut()} aria-label="Sair" className="flex items-center gap-1.5 text-xs text-[#747b7f] hover:text-[#2563eb]">
              <LogOut className="h-3.5 w-3.5" /> <span>Sair</span>
            </button>
          </div>
        </header>
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[#dfe4e6] bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
          {navigation.map((item) => (
            <button key={item.screen} onClick={() => navigate(item.screen)} className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium ${screen === item.screen ? "text-[#2563eb]" : "text-[#747b7f]"}`}>
              {item.icon}<span>{item.short}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

