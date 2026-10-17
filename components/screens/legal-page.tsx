"use client"

import { ArrowLeft, BookOpen, ShieldCheck, Stethoscope } from "lucide-react"
import { NousLogo } from "@/components/ui/nous-logo"
import { useNavigation } from "@/lib/navigation"

const content = {
  privacy: {
    title: "Política de Privacidade",
    eyebrow: "Transparência e proteção de dados",
    intro: "Esta página apresenta, de forma resumida, como o Noûs foi desenhado para lidar com informações usadas no acompanhamento entre sessões.",
    sections: [
      ["1. Finalidade", "O Noûs organiza registros preenchidos pelo paciente, atividades combinadas, agenda e informações de acompanhamento para apoiar a preparação e a continuidade das sessões de psicologia."],
      ["2. Controle e compartilhamento", "O paciente deve saber quais informações são compartilhadas com o profissional vinculado. Registros de diário podem ser privados ou compartilhados conforme a configuração disponível na plataforma."],
      ["3. Uso responsável", "Os dados exibidos pelo Noûs são contexto para a conversa profissional. Indicadores, textos e resumos não devem ser interpretados isoladamente como diagnóstico, triagem automática ou decisão clínica."],
      ["4. Segurança", "O protótipo possui controles demonstrativos de acesso, consentimento e trilha de auditoria. Antes de uso com dados reais, a infraestrutura deve ser configurada com armazenamento, gestão de acesso, retenção, backups e demais controles compatíveis com a legislação aplicável."],
      ["5. Direitos", "Solicitações relacionadas a acesso, correção, portabilidade, eliminação ou outras questões sobre dados pessoais devem ser tratadas pelo responsável pelo tratamento e pelos canais oficiais disponibilizados para o serviço."],
      ["6. Escopo desta página", "Este texto é uma apresentação do funcionamento do protótipo e não substitui uma avaliação jurídica ou uma política definitiva para uma operação em produção."],
    ],
  },
  terms: {
    title: "Termos de Uso",
    eyebrow: "Como o Noûs deve ser utilizado",
    intro: "O Noûs é uma ferramenta de apoio ao acompanhamento psicológico entre sessões. Ele foi concebido para funcionar como um guia de organização para o paciente e para o psicólogo, mantendo a decisão clínica na relação profissional.",
    sections: [
      ["1. O Noûs como guia", "A plataforma ajuda a registrar percepções, organizar atividades, visualizar entradas recentes, lembrar horários e preparar assuntos para a próxima sessão. Ela não substitui a escuta, avaliação ou orientação do psicólogo."],
      ["2. Responsabilidade do paciente", "O paciente é responsável por preencher seus registros de forma voluntária e fiel à sua experiência, respeitando as combinações feitas com seu profissional. Um registro não é uma comprovação automática de que uma atividade foi realizada."],
      ["3. Responsabilidade do psicólogo", "O profissional utiliza as informações como apoio para a sessão, contextualizando os registros e exercendo seu julgamento profissional. Resumos e indicadores devem ser revisados no contexto do atendimento."],
      ["4. Agenda e lembretes", "Horários importados pelo profissional servem como lembretes de sessões e organização da rotina. Um lembrete não constitui confirmação automática de comparecimento, atendimento ou disponibilidade emergencial."],
      ["5. Situações urgentes", "O Noûs não é canal de emergência nem oferece monitoramento contínuo. Em uma situação de risco imediato, a pessoa deve procurar os serviços de emergência e apoio apropriados à sua região."],
      ["6. Dados fictícios no protótipo", "A versão acadêmica/demonstrativa pode conter dados de exemplo. Antes de utilizar dados pessoais reais, a implantação deve aplicar os controles técnicos, administrativos e jurídicos necessários."],
    ],
  },
} as const

export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const { navigate, goBack } = useNavigation()
  const page = content[type]
  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#1f2427]">
      <header className="border-b border-[#e2e7e9] bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <button onClick={goBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[#596165]"><ArrowLeft className="h-4 w-4" /> Voltar</button>
          <NousLogo height={29} />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-10 sm:py-14">
        <div className="mb-7 rounded-xl border border-[#dfe4e6] bg-white p-6 shadow-[0_2px_5px_rgba(31,42,46,.08)] sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-[#eff6ff] p-3 text-[#2563eb]"><ShieldCheck className="h-6 w-6" /></span>
            <div><span className="text-xs font-bold uppercase tracking-[.16em] text-[#2563eb]">{page.eyebrow}</span><h1 className="mt-2 text-3xl font-bold tracking-tight">{page.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#687074]">{page.intro}</p></div>
          </div>
        </div>
        <div className="space-y-4">
          {page.sections.map(([title, body]) => (
            <section key={title} className="rounded-xl border border-[#dfe4e6] bg-white p-6 sm:p-7">
              <h2 className="text-base font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#5f686c]">{body}</p>
            </section>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button onClick={() => navigate("landing")} className="rounded-lg border border-[#d7dde0] bg-white px-4 py-3 text-sm font-bold text-[#4f565a]">Voltar à página inicial</button>
          <div className="flex items-center justify-center gap-2 rounded-lg bg-[#f3f5f5] px-4 py-3 text-xs leading-relaxed text-[#6c7478]"><Stethoscope className="h-4 w-4 shrink-0" /> Ferramenta de apoio, não substituição do profissional.</div>
        </div>
        <div className="mt-8 flex items-center gap-2 text-xs text-[#8a9195]"><BookOpen className="h-4 w-4" /> Documento informativo do protótipo Noûs.</div>
      </main>
    </div>
  )
}
