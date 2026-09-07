# Deploy do NOÛS no Netlify

Este roteiro considera o repositório `Nous-final` conectado ao Netlify.

## 1. Variáveis de ambiente

No Netlify, abra **Project configuration > Environment variables** e crie as variáveis abaixo com disponibilidade para **Functions**:

```text
NOUS_SESSION_SECRET=<valor longo e aleatório>
NOUS_DATA_SECRET=<valor longo e aleatório>
NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO
```

As credenciais demonstrativas podem continuar com os valores padrão ou ser substituídas pelas variáveis de `.env.example`.

Não coloque segredos reais em `netlify.toml`, `.env`, commits ou screenshots públicos.

## 2. Configuração de build

O repositório já contém:

- `netlify.toml` com `npm run build`;
- `.nvmrc` com Node.js 22;
- `package.json` com requisito mínimo de Node.js compatível com Next.js 16.

Não configure `publish` manualmente para uma pasta estática. Este projeto usa rotas de API do Next.js e precisa do runtime do framework.

## 3. Publicar

Depois de substituir os arquivos no repositório:

```bash
git add .
git commit -m "Corrige backend e deploy no Netlify"
git push origin main
```

O Netlify iniciará um novo deploy automaticamente se estiver conectado ao GitHub.

## 4. Teste obrigatório depois do deploy

1. Abra a URL `netlify.app` do projeto.
2. Entre como psicólogo usando o acesso demonstrativo.
3. Abra **Pacientes**.
4. Confirme que aparecem os pacientes fictícios, como Ana Beatriz Silva, Bruno Costa Santos e os demais registros iniciais.
5. Abra um paciente e confirme que o backend retorna os dados autorizados.
6. Repita o teste no domínio personalizado.

Se a tela exibir um erro de backend, use o botão **Tentar novamente** e consulte os logs de Functions no Netlify.

## 5. Por que a correção funciona

O backend não depende mais de escrever em `.data/` dentro do diretório do código quando está em runtime serverless. No Netlify ele escolhe um diretório temporário gravável e, se necessário, recria o estado demonstrativo a partir dos dados fictícios tipados do projeto. Assim, a ausência do arquivo `.data/nous-pilot-state.enc` no GitHub não deixa a lista de pacientes vazia.

As rotas continuam protegidas por sessão e perfil. O frontend não recebe acesso direto ao arquivo ou ao estado completo; `viewForUser` continua filtrando a resposta antes de ela sair do servidor.

## 6. Limite do piloto

O armazenamento temporário do runtime pode ser reiniciado. Isso é aceitável para a demonstração acadêmica com dados fictícios, mas não deve ser apresentado como persistência clínica de produção. A evolução correta é um banco transacional ou armazenamento durável com identidade real, backups e controles adicionais.
