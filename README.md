# NOÛS — acompanhamento psicológico entre sessões

Protótipo funcional construído com Next.js 16, React 19, TypeScript, Tailwind CSS e Recharts. O NOÛS organiza check-ins, diários e atividades terapêuticas para apoiar a conversa clínica sem transformar autorrelatos em diagnóstico ou comprovação automática.

## Identidade visual

- Paciente: laranja NOÛS (`#ff7100`);
- Psicólogo: azul (`#2563eb`), inclusive navegação, foco, gráficos, cartões e diálogos;
- Superfícies neutras, contraste legível e navegação responsiva;
- Textos clínicos distinguem autorrelato do paciente, revisão profissional e prontuário.

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

## Verificação da entrega

Antes de publicar uma nova versão, execute:

```bash
npm run typecheck
npm run build
```

Também existe o atalho:

```bash
npm run check
```

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
- persistência demonstrativa criptografada no servidor.

## Persistência do piloto

Em execução local, o estado demonstrativo é salvo em `.data/nous-pilot-state.enc` usando AES-256-GCM e escrita por arquivo temporário seguida de `rename`.

Em ambientes serverless, como o Netlify, o código usa automaticamente um diretório temporário gravável do runtime. Se o arquivo ainda não existir, o backend inicializa o estado com os pacientes fictícios definidos em `lib/store.ts`. Caso o runtime não permita escrita, existe uma contingência em memória para impedir que a tela profissional fique vazia por uma falha de filesystem.

Essa adaptação mantém o piloto demonstrável no Netlify, mas **não transforma o armazenamento temporário em banco de produção**. Em reinicializações de instância, o estado pode voltar aos dados fictícios iniciais. Antes de usar dados reais, a persistência deve ser migrada para um banco transacional ou serviço de armazenamento durável.

## Deploy no Netlify e domínio próprio

O projeto inclui `netlify.toml` e `.nvmrc` para padronizar o build com Node.js 22. O Netlify detecta o Next.js e publica as rotas de API junto com a aplicação.

Configure no painel do Netlify, com escopo disponível para **Functions**:

- `NOUS_SESSION_SECRET`: segredo longo e aleatório para assinatura da sessão;
- `NOUS_DATA_SECRET`: segredo longo e aleatório para a criptografia do estado;
- `NEXT_PUBLIC_SITE_URL`: URL pública do site, por exemplo `https://seudominio.com.br`;
- credenciais demonstrativas opcionais listadas em `.env.example`.

As chamadas do frontend usam caminhos relativos (`/api/auth` e `/api/pilot`). Por isso, o mesmo backend funciona tanto no subdomínio `netlify.app` quanto no domínio personalizado apontado para o mesmo site.

Veja o passo a passo em [`DEPLOY-NETLIFY.md`](DEPLOY-NETLIFY.md).

## Ciclo de uma atividade terapêutica

1. O psicólogo propõe ou edita uma atividade. Uma edição cria uma nova versão.
2. O paciente pode iniciar a atividade e registrar quando a realizou.
3. Para informar a conclusão, o paciente descreve como realizou, o que percebeu e confirma que o relato corresponde à sua experiência.
4. A atividade passa para **Conclusão informada**. Isso é um autorrelato, não uma prova obtida por vigilância.
5. O psicólogo lê o relato, registra uma devolutiva e marca a atividade como **Revisada**.

Esse modelo preserva autonomia, contexto, versão da orientação e responsabilidade profissional.

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
- `lib/server-pilot-store.ts`: autorização por papel, regras de domínio, persistência criptografada e auditoria;
- `lib/pilot-context.tsx`: estado remoto e ações consumidas pela interface;
- `lib/date.ts`: datas de calendário sem deslocamento indevido de fuso horário;
- `lib/likert.ts`: valores e significados da escala;
- `components/screens/patient-tasks.tsx`: autorrelato estruturado de atividade;
- `components/screens/psy-follow-up.tsx`: proposta, edição, leitura e revisão profissional;
- `components/screens/mood-history.tsx`: histórico de check-ins e diários;
- `components/screens/psy-patients.tsx`: lista de pacientes, estados de carregamento/erro e encerramento de vínculo.

O fluxo principal permanece: navegador → API → validação da sessão → autorização do perfil → regra de negócio → persistência → resposta filtrada por `viewForUser`.

## Relação com a Fase 01 do 6º período

O código foi organizado para permanecer coerente com a documentação da entrega: autenticação e sessão em `/api/auth`, autorização e mutações em `/api/pilot`, regras e persistência em `server-pilot-store.ts`, contratos em `pilot-types.ts` e consumo remoto no `pilot-context.tsx`.

A correspondência entre implementação, regras de negócio, requisitos e critérios da rubrica está resumida em [`docs/ENTREGA-FASE-01.md`](docs/ENTREGA-FASE-01.md).

## Limites de segurança e produção

Esta entrega é adequada para validação acadêmica com dados fictícios. Contas fixas, fallback demonstrativo de segredo e armazenamento temporário de runtime não são infraestrutura clínica multiusuário.

Antes de usar dados reais, ainda são necessários: provedor de identidade, banco transacional, separação por clínica, gestão de chaves e segredos, MFA real, recuperação de conta, rate limiting, proteção CSRF, backups testados, retenção e descarte de dados, logs imutáveis, resposta a incidentes, revisão jurídica/LGPD e validação clínica com psicólogos e pacientes.

O produto não oferece monitoramento de emergência, diagnóstico, prognóstico ou decisão clínica automatizada. Convites, MFA e solicitações de privacidade continuam sendo simulações de interface.
