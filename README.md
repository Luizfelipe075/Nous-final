# NOÛS — acompanhamento psicológico entre sessões

Protótipo funcional construído com Next.js 16, React 19, TypeScript, Tailwind CSS e Recharts. O NOÛS organiza check-ins, diários e atividades terapêuticas para apoiar a conversa clínica sem transformar autorrelatos em diagnóstico ou comprovação automática.

## Identidade visual

- paciente: laranja NOÛS (`#ff7100`);
- psicólogo: azul (`#2563eb`), inclusive navegação, foco, gráficos, cartões e diálogos;
- superfícies neutras, contraste legível e navegação responsiva;
- textos clínicos distinguem autorrelato do paciente, revisão profissional e prontuário.

## Executar localmente

```bash
npm install
npm run dev
```

Por padrão, a aplicação usa `http://localhost:3000`. Use os acessos demonstrativos disponíveis na própria tela de entrada:

| Perfil | E-mail | Senha |
|---|---|---|
| Paciente | `paciente@demo.nous` | `NousPaciente2026!` |
| Psicólogo | `psicologo@demo.nous` | `NousPsicologo2026!` |

As credenciais podem ser substituídas pelas variáveis descritas em `.env.example`.

## Fluxos implementados

- sessão assinada em cookie `HttpOnly`, validada no servidor e separada por perfil;
- rotas navegáveis e protegidas para paciente e psicólogo;
- consentimento para compartilhamento de check-ins e escolha individual de visibilidade do diário;
- check-in de humor, energia, sono e ansiedade em escala Likert de 1 a 5;
- histórico com abertura do conteúdo de cada check-in recente;
- diário de emoções com filtros entre registros privados e compartilhados;
- atividades com prazo, versão, relato estruturado de conclusão e revisão do psicólogo;
- abertura direta da atividade e do paciente a partir do painel profissional;
- lista profissional de pacientes com encerramento de vínculo preservando o histórico;
- relatórios isolados por paciente e áreas distintas para prontuário e anotação privada;
- trilha de auditoria no servidor e exportação dos dados acessíveis ao perfil autenticado;
- persistência demonstrativa criptografada no servidor em `.data/nous-pilot-state.enc`.

## Ciclo de uma atividade terapêutica

1. O psicólogo propõe ou edita uma atividade. Uma edição cria uma nova versão.
2. O paciente pode iniciar a atividade e registrar quando a realizou.
3. Para informar a conclusão, o paciente descreve como realizou, o que percebeu e confirma que o relato corresponde à sua experiência.
4. A atividade passa para **Conclusão informada**. Isso é um autorrelato, não uma prova obtida por vigilância.
5. O psicólogo lê o relato, registra uma devolutiva e marca a atividade como **Revisada**.

Esse modelo é mais coerente para o contexto clínico do que um simples botão “Concluir”: preserva autonomia, contexto, versão da orientação e responsabilidade profissional.

## Convenção Likert

| Valor | Significado |
|---:|---|
| 1 | Muito baixo |
| 2 | Baixo |
| 3 | Moderado |
| 4 | Alto |
| 5 | Muito alto |

Para ansiedade, um valor maior indica maior ansiedade percebida. Os rótulos acompanham os números para reduzir ambiguidade; nenhuma média produz diagnóstico.

## Arquitetura

- `app/api/auth`: criação, leitura e encerramento da sessão demonstrativa;
- `app/api/pilot`: fachada autenticada para leitura e alteração do estado;
- `lib/server-pilot-store.ts`: autorização por papel, persistência criptografada e auditoria;
- `lib/pilot-context.tsx`: estado remoto e ações consumidas pela interface;
- `lib/date.ts`: datas de calendário sem deslocamento indevido de fuso horário;
- `lib/likert.ts`: valores e significados da escala;
- `components/screens/patient-tasks.tsx`: autorrelato estruturado de atividade;
- `components/screens/psy-follow-up.tsx`: proposta, edição, leitura e revisão profissional;
- `components/screens/mood-history.tsx`: histórico de check-ins e diários.

## Limites de segurança e produção

Esta entrega é adequada para validação de produto com dados fictícios. A persistência em arquivo criptografado e as contas fixas não são uma infraestrutura clínica multiusuário.

Antes de usar dados reais, ainda são necessários: provedor de identidade, banco transacional, separação por clínica, gestão de chaves e segredos, MFA real, recuperação de conta, rate limiting, proteção CSRF, backups testados, retenção e descarte de dados, logs imutáveis, resposta a incidentes, revisão jurídica/LGPD e validação clínica com psicólogos e pacientes.

O produto não oferece monitoramento de emergência, diagnóstico, prognóstico ou decisão clínica automatizada. Convites, MFA e solicitações de privacidade continuam sendo simulações de interface.
