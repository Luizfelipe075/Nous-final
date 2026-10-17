"use client"

import { useEffect } from "react"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { NavigationProvider, useNavigation } from "@/lib/navigation"
import { LandingPage } from "@/components/screens/landing-page"
import { LoginScreen } from "@/components/screens/login-screen"
import { TutorialScreen } from "@/components/screens/tutorial-screen"
import { PatientDashboard } from "@/components/screens/patient-dashboard"
import { MoodDiary } from "@/components/screens/mood-diary"
import { MoodHistory } from "@/components/screens/mood-history"
import { MeditationsScreen } from "@/components/screens/meditations-screen"
import { EmotionWheelScreen } from "@/components/screens/emotion-wheel-screen"
import { PsyDashboard } from "@/components/screens/psy-dashboard"
import { PsyPatients } from "@/components/screens/psy-patients"
import { PsyPatientDetail } from "@/components/screens/psy-patient-detail"
import { PsyAlphabetical } from "@/components/screens/psy-alphabetical"
import { PsyReports } from "@/components/screens/psy-reports"
import { PsyFollowUp } from "@/components/screens/psy-follow-up"
import { PsySettings } from "@/components/screens/psy-settings"
import { PatientTasks } from "@/components/screens/patient-tasks"
import { PatientPrivacy } from "@/components/screens/patient-privacy"
import { LegalPage } from "@/components/screens/legal-page"
import { PilotProvider } from "@/lib/pilot-context"

function AppRouter() {
  const { screen, navigate } = useNavigation()
  const { user, loading } = useAuth()

  const patientScreens = new Set(["tutorial", "patient-dashboard", "mood-diary", "mood-history", "meditations", "emotion-wheel", "patient-tasks", "patient-privacy"])
  const psychologistScreens = new Set(["psy-dashboard", "psy-patients", "psy-patient-detail", "psy-reports", "psy-report-view", "psy-alphabetical", "psy-follow-up", "psy-settings"])
  const protectedScreen = patientScreens.has(screen) || psychologistScreens.has(screen)
  const wrongRole = Boolean(user) && ((patientScreens.has(screen) && user?.role !== "paciente") || (psychologistScreens.has(screen) && user?.role !== "psicologo"))

  useEffect(() => {
    if (loading) return
    if (!user && protectedScreen) navigate("login", { role: patientScreens.has(screen) ? "paciente" : "psicologo" })
    else if (wrongRole && user) navigate(user.role === "paciente" ? "patient-dashboard" : "psy-dashboard")
  }, [loading, user, protectedScreen, wrongRole, screen, navigate])

  if (loading || (!user && protectedScreen) || wrongRole) {
    return <main className="grid min-h-screen place-items-center bg-[#f8fafb]"><p className="text-sm font-semibold text-[#687074]">Verificando acesso…</p></main>
  }

  switch (screen) {
    case "landing":
      return <LandingPage />
    case "privacy":
      return <LegalPage type="privacy" />
    case "terms":
      return <LegalPage type="terms" />
    case "login":
      return <LoginScreen />
    case "tutorial":
      return <TutorialScreen />
    case "patient-dashboard":
      return <PatientDashboard />
    case "mood-diary":
      return <MoodDiary />
    case "mood-history":
      return <MoodHistory />
    case "meditations":
      return <MeditationsScreen />
    case "emotion-wheel":
      return <EmotionWheelScreen />
    case "psy-dashboard":
      return <PsyDashboard />
    case "psy-patients":
    case "psy-patient-detail":
      return screen === "psy-patient-detail" ? <PsyPatientDetail /> : <PsyPatients />
    case "psy-alphabetical":
      return <PsyAlphabetical />
    case "psy-reports":
    case "psy-report-view":
      return <PsyReports />
    case "psy-follow-up":
      return <PsyFollowUp />
    case "psy-settings":
      return <PsySettings />
    case "patient-tasks":
      return <PatientTasks />
    case "patient-privacy":
      return <PatientPrivacy />
    default:
      return <LandingPage />
  }
}

export default function Home() {
  return (
    <AuthProvider>
      <PilotProvider>
        <NavigationProvider>
          <AppRouter />
        </NavigationProvider>
      </PilotProvider>
    </AuthProvider>
  )
}
