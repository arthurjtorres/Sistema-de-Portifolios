# Arquitetura

Monólito modular em React. Cada domínio fica em `src/modules/<domínio>` com camadas explícitas; o que é transversal fica fora dos módulos.

```text
src/
├── components/ui/        Botões, campos, alertas, diálogo, estados (sem regra de negócio)
├── components/shared/    Peças reutilizáveis de produto (Logo, ImageThumb, ReorderButtons, RouteNotice)
├── config/               env (validação), media (limites), routes (caminhos)
├── hooks/                useAsyncData, useMessages, useOnlineStatus
├── i18n/                 Configuração e locales/pt-BR/<namespace>.json
├── infrastructure/firebase/  Inicialização, caminhos, mapeadores de documentos
├── layouts/              AppLayout (autenticado), AuthLayout
├── lib/                  errors, validation, ordering, format (puros e testados)
├── modules/
│   ├── authentication/   context, services, validation, route guards
│   ├── portfolios/       types, repositories, services, validation, components
│   ├── projects/         types, repositories, services, validation, components
│   └── media/            services (Storage), validation, components (pickers)
├── pages/                Telas por rota (compõem módulos)
├── routes/AppRoutes.tsx  Árvore de rotas
└── test/                 Setup e helpers de teste
```

Divergência consciente da estrutura de referência do projeto: `layouts/` e `routes/` ficam na raiz de `src/` (em vez de `app/`), por serem poucos arquivos. Ver ADR-008.

## Camadas e fluxo de dados

`pages` → `services` (regras de negócio e orquestração de upload/limpeza) → `repositories` (única camada que usa o SDK do Firestore) / `mediaService` (única que usa o SDK do Storage). Leituras simples (listas, detalhe) vão da página direto ao repositório via `useAsyncData`; operações com regra ou efeito colateral passam por `services`.

Nenhum componente importa `firebase/*` diretamente; apenas `infrastructure/`, `repositories/` e `services/`.

## Modelo de dados

```text
users/{uid}/portfolios/{portfolioId}   ownerId, name, description, coverImage|null, sortOrder, createdAt, updatedAt
users/{uid}/projects/{projectId}       ownerId, portfolioId, name, description, coverImage|null, images[], externalUrl|null, sortOrder, createdAt, updatedAt
Storage: users/{uid}/{portfolios|projects}/{resourceId}/{uuid}.{jpg|png|webp}
```

O UID no caminho é a base do isolamento. Uma futura publicação pública poderia adicionar um campo/coleção própria sem alterar este esqueleto (ADR-008).

## Padrões relevantes

- **Leituras pontuais** (`getDocs`/`getDoc`/`getCountFromServer`), sem listeners em tempo real. Contagens do painel não baixam documentos.
- **Erros**: `AppError` com código estável; a mensagem exibida vem de `errors.json`. Detalhe técnico só no log (`logError`), sem dados pessoais.
- **Criação com upload**: o ID do documento é gerado antes, o arquivo é enviado para a pasta correta, e só então o documento é gravado; se a gravação falha, o arquivo enviado é removido. Em edição, arquivos antigos só são apagados após o documento ser salvo.
- **Ordenação**: `sortOrder` numérico; novos itens usam o horário de criação (vão para o fim sem leitura prévia); subir/descer troca o valor com o vizinho e não altera `updatedAt`.
- **Sessão**: `status` `loading` impede redirecionamentos prematuros; logout recarrega a página para descartar todo estado/cache em memória.
- **i18n**: todo texto de interface em `locales/pt-BR`; chaves tipadas por `i18next.d.ts`; datas/números via `Intl` (`lib/format.ts`). Para novo idioma: copiar a pasta de locale e registrá-la em `i18n/index.ts`.
