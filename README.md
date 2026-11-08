# Portfolio Manager

Aplicação web para organizar portfólios profissionais e os projetos de cada um. Cada usuário vê e administra apenas os próprios dados. Portfólios são **privados** nesta versão; não há publicação pública.

## Tecnologias

React 19 · Vite · TypeScript (strict) · Tailwind CSS 4 · React Router 7 · i18next/react-i18next (pt-BR) · Firebase Authentication, Cloud Firestore e Storage · Vitest + React Testing Library · `@firebase/rules-unit-testing` + Firebase Emulator Suite.

> As versões estão em `package.json` como faixas (`^`). Elas **não foram resolvidas contra o registro npm** na criação deste código (ambiente sem acesso à rede). O `npm install` gera o `package-lock.json`; versione-o após a primeira instalação bem-sucedida e valide.

## Funcionalidades

Cadastro, login, logout e recuperação de senha · rotas privadas com sessão persistida · painel (totais, recentes, ações rápidas, estados vazios) · CRUD de portfólios e de projetos · projetos vinculados a portfólios do próprio usuário · ordem de exibição (subir/descer) · upload de imagens (capa e galeria) com validação, progresso e pré-visualização · confirmação em exclusões · interface responsiva em pt-BR.

## Requisitos

- Node.js 20.19+ (ou 22.12+) e npm
- Java 21+ (necessário ao Firestore Emulator, só para `test:rules` e `emulators`)
- Um projeto Firebase para uso real (ver [docs/FIREBASE.md](docs/FIREBASE.md)); para desenvolvimento local, os emuladores bastam.

## Executar no Windows (PowerShell)

```powershell
git clone https://github.com/arthurjtorres/sistema-de-portifolios.git
cd sistema-de-portifolios
git checkout feat/portfolio-manager-initial-implementation

npm install
Copy-Item .env.example .env.local
# edite .env.local (veja a seção abaixo)

npm run dev        # http://localhost:5173
```

Se o PowerShell bloquear `npm`/`npx` por política de execução: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

### Variáveis de ambiente (`.env.local`)

| Variável | Onde obter |
|---|---|
| `VITE_FIREBASE_API_KEY` | Console Firebase → Configurações do projeto → Seus apps (Web) |
| `VITE_FIREBASE_AUTH_DOMAIN` | idem |
| `VITE_FIREBASE_PROJECT_ID` | idem |
| `VITE_FIREBASE_STORAGE_BUCKET` | idem |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | idem |
| `VITE_FIREBASE_APP_ID` | idem |
| `VITE_USE_FIREBASE_EMULATORS` | `true` para usar emuladores locais (padrão `false`) |

Valores `VITE_` vão para o navegador e **não são segredos**. Sem eles, o app mostra uma tela listando o que falta.

### Desenvolvimento 100% local (sem tocar no Firebase real)

Terminal 1: `npm run emulators` · Terminal 2: `npm run dev` com, em `.env.local`:

```
VITE_USE_FIREBASE_EMULATORS=true
VITE_FIREBASE_PROJECT_ID=demo-portfolio-manager
VITE_FIREBASE_API_KEY=demo
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_STORAGE_BUCKET=demo-portfolio-manager.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=0
VITE_FIREBASE_APP_ID=demo
```

## Scripts

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Verificação de tipos + build de produção (`dist/`) |
| `npm run preview` | Serve o build localmente |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm test` | Testes unitários e de componentes (Vitest) |
| `npm run test:rules` | Testes das Security Rules nos emuladores |
| `npm run validate` | typecheck + lint + test + build |

## Documentação

- [Arquitetura](docs/ARQUITETURA.md) · [Firebase](docs/FIREBASE.md) · [Segurança e regras](docs/SEGURANCA.md) · [Testes](docs/TESTES.md) · [Decisões (ADR)](docs/DECISOES.md)
