# Evidências técnicas — Projeto Integrador 6º período, Fase 01

Este arquivo serve como mapa rápido entre a implementação presente no repositório e os critérios avaliados na Fase 01. A documentação acadêmica principal continua sendo o PDF entregue no Moodle.

## 1. Implementação do backend e regras de negócio — 1,5

Evidências no código:

- `app/api/auth/login/route.ts`: valida credenciais e perfil antes de criar a sessão;
- `app/api/auth/session/route.ts`: consulta da sessão atual;
- `app/api/auth/logout/route.ts`: encerramento do acesso;
- `app/api/pilot/route.ts`: fachada autenticada para leitura e mutações;
- `lib/server-auth.ts`: assinatura e validação da sessão;
- `lib/server-pilot-store.ts`: regras do domínio, validações, auditoria e persistência;
- `viewForUser`: menor exposição de dados conforme perfil, vínculo e consentimento.

As mutações cobrem check-ins, consentimento, diário, atividades, revisão, configurações, convites, registros profissionais, encerramento de vínculo e auditoria.

## 2. Aderência à arquitetura definida — 1,5

A implementação mantém as responsabilidades separadas:

```text
Interface / components
        ↓
pilot-context.tsx
        ↓
/api/auth e /api/pilot
        ↓
server-auth.ts + server-pilot-store.ts
        ↓
persistência demonstrativa
        ↓
viewForUser → resposta autorizada
```

O navegador não lê diretamente o armazenamento do servidor e não decide sozinho quais dados o perfil pode consultar.

## 3. Coerência entre backend, dados e requisitos — 1,5

- `lib/pilot-types.ts` centraliza os contratos de Paciente, Check-in, Diário, Atividade, Autorrelato, Revisão, Registro Profissional, Consentimento, Convite e Auditoria;
- `lib/store.ts` contém somente os dados fictícios de inicialização do piloto;
- as ações de `performPilotAction` aplicam as regras RN-001 a RN-014 descritas no documento;
- `viewForUser` aplica autorização por perfil e compartilhamento;
- o encerramento de vínculo preserva os registros e remove o paciente da lista ativa;
- a edição de atividade incrementa a versão e invalida conclusão incompatível;
- valores do check-in são validados na faixa de 1 a 5.

## 4. Organização do código e repositório — 1,0

Estrutura principal:

- `app/`: páginas, layout e API;
- `components/screens/`: telas por fluxo;
- `components/ui/`: componentes reutilizáveis;
- `lib/`: domínio, autenticação, integração, tipos e persistência;
- `public/`: recursos estáticos;
- `docs/`: evidências e orientação de deploy.

Arquivos gerados e sensíveis ficam fora do versionamento por `.gitignore`: `node_modules`, `.next`, `.data`, `.env` e `.env.local`.

## 5. Planejamento do semestre — 1,5

O código entregue corresponde ao planejamento documentado para a primeira versão do backend: sessão e autorização, persistência e regras de domínio, integração dos fluxos e revisão técnica. O repositório oferece `npm run typecheck`, `npm run build` e `npm run check` como evidências reproduzíveis da consistência técnica.

## 6. Organização do documento — 1,0

O repositório foi mantido coerente com as seções obrigatórias do documento: histórico, planejamento, regras de negócio, requisitos funcionais, dados/modelagem, arquitetura, tecnologias e implementação backend.

## Observação sobre o Netlify

No ambiente local, o estado criptografado permanece em `.data/nous-pilot-state.enc`. Em runtime serverless, o backend usa armazenamento temporário gravável e contingência em memória para manter a demonstração funcional e garantir que os pacientes fictícios sejam carregados. Essa adaptação é deliberadamente limitada ao piloto acadêmico; persistência clínica real continua planejada para uma infraestrutura transacional.
