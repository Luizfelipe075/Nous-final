"use client"

import { useNavigation, type Screen } from "@/lib/navigation"
import { useAuth } from "@/lib/auth-context"
import { BarChart3, BookHeart, CheckSquare2, ClipboardCheck, Home, LogOut, ShieldCheck } from "lucide-react"
import { NousLogo } from "@/components/ui/nous-logo"

const navigation: { screen: Screen; label: string; short: string; icon: React.ReactNode }[] = [
  { screen: "patient-dashboard", label: "Início", short: "Início", icon: <Home className="h-4 w-4" /> },
  { screen: "mood-diary", label: "Humor", short: "Humor", icon: <ClipboardCheck className="h-4 w-4" /> },
  { screen: "patient-tasks", label: "Atividades", short: "Tarefas", icon: <CheckSquare2 className="h-4 w-4" /> },
  { screen: "mood-history", label: "Histórico", short: "Histórico", icon: <BarChart3 className="h-4 w-4" /> },
  { screen: "emotion-wheel", label: "Diário de emoções", short: "Diário", icon: <BookHeart className="h-4 w-4" /> },
]

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const { screen, navigate } = useNavigation()
  const { user, logout } = useAuth()
  const signOut = async () => { await logout(); navigate("landing") }

  return (
    <div className="portal-patient min-h-screen bg-[#f8fafb] lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="hidden min-h-screen flex-col border-r border-[#e2e7e9] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="px-5 pb-6 pt-5"><NousLogo height={29} /></div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navigation.map((item) => {
            const active = screen === item.screen
            return (
              <button
                key={item.screen}
                onClick={() => navigate(item.screen)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active ? "bg-[#ffe8d6] text-[#e86600]" : "text-[#4f565a] hover:bg-[#f5f7f7] hover:text-[#171b1e]"}`}
              >
                <span className={active ? "text-[#ff7100]" : "text-[#71787c]"}>{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#e2e7e9] bg-white/95 px-4 backdrop-blur lg:px-7">
          <div className="lg:hidden"><NousLogo height={27} /></div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3"><button onClick={() => navigate("patient-privacy")} aria-label="Privacidade e preferências" className="rounded-lg p-2 text-[#747b7f] hover:bg-[#fff0e4] hover:text-[#ff7100]"><ShieldCheck className="h-4 w-4" /></button><span className="hidden text-xs font-medium text-[#535a5e] sm:block">{user?.name}</span><button onClick={() => void signOut()} aria-label="Sair" className="flex items-center gap-1.5 text-xs text-[#747b7f] hover:text-[#ff7100]"><LogOut className="h-3.5 w-3.5" /> <span>Sair</span></button></div>
        </header>
        <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#dfe4e6] bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
          {navigation.map((item) => (
            <button key={item.screen} onClick={() => navigate(item.screen)} className={`flex flex-col items-center gap-1 px-1 py-1 text-[10px] font-medium ${screen === item.screen ? "text-[#ff7100]" : "text-[#747b7f]"}`}>
              {item.icon}<span>{item.short}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
