"use client"

import { useState } from "react"
import { useNavigation } from "@/lib/navigation"
import { ClipboardCheck, BarChart3, BookHeart, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { usePilot } from "@/lib/pilot-context"

const steps = [
  {
    icon: <ClipboardCheck className="h-12 w-12" />,
    title: "Faça seu Check-in Likert",
    description:
      "Registre humor, energia, sono e ansiedade na mesma escala de 1 a 5. Os rótulos mostram claramente o significado de cada nível.",
  },
  {
    icon: <BarChart3 className="h-12 w-12" />,
    title: "Acompanhe o Histórico",
    description:
      "Compare seus próprios registros ao longo do tempo. A visualização ajuda a perceber tendências sem classificar dias como certos ou errados.",
  },
  {
    icon: <BookHeart className="h-12 w-12" />,
    title: "Use o Diário de Emoções",
    description:
      "Registre a emoção predominante, intensidade, contexto, sinais físicos e estratégias. O diário qualitativo fica separado das médias.",
  },
  {
    icon: <ShieldCheck className="h-12 w-12" />,
    title: "Interprete com responsabilidade",
    description:
      "Os dados apoiam a conversa com o psicólogo. Eles não produzem diagnóstico e o diário só deve ser compartilhado com consentimento.",
  },
]

export function TutorialScreen() {
  const { navigate } = useNavigation()
  const { updateConsent } = usePilot()
  const [currentStep, setCurrentStep] = useState(0)
  const [accepted, setAccepted] = useState(false)
  const finish = async () => { await updateConsent({ accepted: true, acceptedAt: new Date().toISOString() }); navigate("patient-dashboard") }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "#f8fafb" }}>
      <div className="w-full max-w-lg rounded-lg bg-white p-10 shadow-sm border border-border">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#90979b" }}>
            Tutorial
          </span>
          <span className="text-xs font-medium" style={{ color: "#687074" }}>
            {currentStep + 1} de {steps.length}
          </span>
        </div>

        <div className="mb-8 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= currentStep ? "#ff7100" : "#e0e0e8" }}
            />
          ))}
        </div>

        <div className="mb-10 flex flex-col items-center text-center">
          <div
            className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-lg"
            style={{ backgroundColor: "rgba(255,113,0,0.10)", color: "#ff7100" }}
          >
            {steps[currentStep].icon}
          </div>
          <h2 className="mb-4 text-2xl font-black" style={{ color: "#1f2427" }}>
            {steps[currentStep].title}
          </h2>
          <p className="text-base leading-relaxed" style={{ color: "#687074" }}>
            {steps[currentStep].description}
          </p>
          {currentStep === steps.length - 1 && <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-[#eadfd9] bg-[#fff8f3] p-4 text-left"><Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(checked === true)} className="mt-0.5" /><span className="text-xs leading-relaxed text-[#656d71]">Li e entendi que o NOUS apoia meu acompanhamento, não é um canal de emergência e não realiza diagnóstico. Posso ajustar o compartilhamento na área de privacidade.</span></label>}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-30"
            style={{ color: "#687074" }}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="inline-flex items-center gap-1 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#ff7100" }}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => void finish()}
              disabled={!accepted}
              className="inline-flex items-center gap-1 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#ff7100", opacity: accepted ? 1 : .4 }}
            >
              Começar a Usar
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-[#90979b]">No primeiro acesso, a confirmação final é necessária para entrar no ambiente do piloto.</p>
      </div>
    </div>
  )
}
