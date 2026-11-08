# Testes

| Camada | Ferramenta | Comando | Pasta |
|---|---|---|---|
| Unidade e componentes | Vitest + React Testing Library (jsdom) | `npm test` | `src/**/*.test.ts(x)` |
| Security Rules | `@firebase/rules-unit-testing` + emuladores | `npm run test:rules` | `tests/rules/` |
| End-to-end | Playwright | **não configurado** | — |

## O que há

- Validações (`lib/validation`, auth, mídia), erros, ordenação, parsing do ambiente.
- Proteção de rotas (visitante, sessão carregando sem redirecionar, autenticado, telas públicas).
- Formulário de login: renderização, validação, envio, erro compreensível.
- Diálogo de confirmação de exclusão.
- Regras do Firestore e Storage (ver [SEGURANCA.md](SEGURANCA.md)).

## Lacunas conhecidas

- Sem testes de componente para as páginas de portfólios/projetos (CRUD de ponta a ponta na interface) e sem E2E: dependem de emuladores ou de mocks extensos de repositórios. Playwright foi deixado de fora de propósito (pede aprovação, navegadores e emuladores em CI).
- Os serviços (`portfolioService`, `projectService`) não têm testes unitários com SDK mockado.
- Offline/reconexão e troca de usuário não têm teste automatizado.

## Requisitos

`test:rules` precisa de Java 21+ e baixa os emuladores na primeira execução. Não usa credenciais nem o projeto real (`demo-portfolio-manager`).
