"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { PatientLayout } from "./patient-layout"
import { moodLabels, moodColors } from "@/lib/store"
import { Check, Lock } from "lucide-react"

const activities = [
  "Trabalho","Exercício","Meditação","Leitura","Social",
  "Família","Natureza","Lazer","Estudo","Casa","Terapia","Música",
]

function Section({ title, description, children, locked }: {
  title: string; description?: string; children: React.ReactNode; locked?: boolean
}) {
  return (
    <div className={`mb-6 rounded-lg bg-white p-6 shadow-sm border border-border transition-opacity ${locked ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between mb-0.5">
        <h3 className="text-base font-bold" style={{ color: "#1f2427" }}>{title}</h3>
        {locked && <Lock className="h-4 w-4" style={{ color: "#90979b" }} />}
      </div>
      {description && <p className="mb-4 text-sm" style={{ color: "#687074" }}>{description}</p>}
      {!description && <div className="mb-4" />}
      {children}
    </div>
  )
}

export function MeditationsScreen() {
  const [mood, setMood] = useState(3)
  const [note, setNote] = useState("")
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [sleepQuality, setSleepQuality]   = useState([3])
  const [anxietyLevel, setAnxietyLevel]   = useState([3])
  const [energyLevel, setEnergyLevel]     = useState([3])
  const [submitted, setSubmitted]         = useState(false)

  const toggleActivity = (activity: string) => {
    if (submitted) return
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    )
  }

  const handleSubmit = () => { setSubmitted(true) }

  return (
    <PatientLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-black" style={{ color: "#1f2427" }}>Registro do Dia</h1>
        <p className="mb-6 text-sm" style={{ color: "#687074" }}>Responda as perguntas para acompanhar sua evolução</p>

        {submitted && (
          <div className="mb-6 rounded-lg border p-5" style={{ backgroundColor: "rgba(34,197,94,0.07)", borderColor: "rgba(34,197,94,0.25)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: "#22c55e" }}>
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold" style={{ color: "#16a34a" }}>Registro salvo com sucesso!</span>
            </div>
            <div className="flex items-center gap-1.5 ml-9">
              <Lock className="h-3 w-3" style={{ color: "#90979b" }} />
              <p className="text-xs" style={{ color: "#687074" }}>
                Este registro está bloqueado para edição — garantindo a integridade dos seus dados clínicos.
              </p>
            </div>
          </div>
        )}

        <Section title="Como você está se sentindo?" description="Selecione o nível que melhor representa seu humor agora" locked={submitted}>
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => !submitted && setMood(level)}
                disabled={submitted}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 transition-all sm:h-20 sm:w-20 disabled:cursor-not-allowed"
                style={mood === level
                  ? { borderColor: "#ff7100", backgroundColor: "rgba(255,113,0,0.10)", transform: submitted ? "none" : "scale(1.1)" }
                  : { borderColor: "#e0e0e8", backgroundColor: "#fff" }}
              >
                <span className="text-2xl">
                  {level === 1 ? "😢" : level === 2 ? "😕" : level === 3 ? "😐" : level === 4 ? "😊" : "😄"}
                </span>
                <span className="mt-1 text-[10px] sm:text-xs" style={{ color: "#687074" }}>{moodLabels[level]}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="inline-block rounded-full px-4 py-1 text-sm font-semibold text-white"
                  style={{ backgroundColor: moodColors[mood] }}>
              {moodLabels[mood]}
            </span>
          </div>
        </Section>

        <Section title="Indicadores do Dia" locked={submitted}>
          <div className="flex flex-col gap-6">
            {[
              { label: "Qualidade do Sono",  value: sleepQuality,  setter: setSleepQuality },
              { label: "Nível de Ansiedade", value: anxietyLevel,  setter: setAnxietyLevel },
              { label: "Nível de Energia",   value: energyLevel,   setter: setEnergyLevel  },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between">
                  <Label style={{ color: "#1f2427" }}>{label}</Label>
                  <span className="text-sm font-semibold" style={{ color: "#ff7100" }}>{value[0]}/5</span>
                </div>
                <Slider value={value} onValueChange={submitted ? () => {} : setter} min={1} max={5} step={1} disabled={submitted} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Atividades do Dia" description="Selecione as atividades que você fez hoje" locked={submitted}>
          <div className="flex flex-wrap gap-2">
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => toggleActivity(activity)}
                disabled={submitted}
                className="rounded-full border px-3 py-1.5 text-sm font-medium transition-all disabled:cursor-not-allowed"
                style={selectedActivities.includes(activity)
                  ? { backgroundColor: "#ff7100", borderColor: "#ff7100", color: "#fff" }
                  : { borderColor: "#e0e0e8", color: "#687074", backgroundColor: "#fff" }}
              >
                {activity}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Anotações" description="Escreva livremente sobre seu dia" locked={submitted}>
          <Textarea
            placeholder="Como foi seu dia? O que você sentiu? O que te marcou?"
            value={note}
            onChange={(e) => !submitted && setNote(e.target.value)}
            readOnly={submitted}
            rows={4}
            className="resize-none"
            style={submitted ? { cursor: "not-allowed", opacity: 0.7 } : {}}
          />
        </Section>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="w-full rounded-lg py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#ff7100" }}
          >
            Salvar Registro
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg py-3.5 border" style={{ borderColor: "#e0e0e8", color: "#90979b" }}>
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Registro bloqueado — RNE-002</span>
          </div>
        )}
      </div>
    </PatientLayout>
  )
}

