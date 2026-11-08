# Decisões arquiteturais (continuação do registro 001–007 da base do projeto)

Status **proposta** = adotada provisoriamente por ser simples e reversível, aguardando aprovação.

## ADR-008 — Estrutura de dados e de pastas
**Status:** proposta. **Decisão:** subcoleções `users/{uid}/portfolios` e `users/{uid}/projects` (projeto referencia `portfolioId`); Storage em `users/{uid}/{tipo}/{id}/…`. **Alternativas:** coleções raiz com `ownerId` (regras dependem de filtros/`get` por documento) e projetos aninhados em portfólios (impede mover projeto e listar todos). **Justificativa:** o UID no caminho torna o isolamento trivial de regra e de consulta; projetos independentes permitem listar todos e reatribuir. **Consequências:** publicação pública futura exigirá campo/coleção próprios (ex.: índice público por slug). Estrutura de `src/` difere levemente da referência (sem `app/`).

## ADR-009 — Exclusão de portfólio com projetos
**Status:** **decisão pendente do responsável.** **Comportamento atual:** exclusão **bloqueada** enquanto houver projetos (mensagem orienta mover/excluir projetos). **Opções:** cascata (apaga projetos e imagens), arquivamento, ou manter bloqueio. **Nota:** o bloqueio é do cliente; as regras não o impõem. **Ainda não existe** mover projeto em lote; o usuário edita cada projeto.

## ADR-010 — Internacionalização
**Status:** proposta. `i18next` + `react-i18next`, namespaces por domínio, chaves tipadas, `Intl` para formatação, idioma fixo `pt-BR` nesta versão (sem seletor).

## ADR-011 — Limites de campos e de mídia
**Status:** **proposta, aguardando aprovação.** Imagens JPEG/PNG/WebP, 5 MB, até 8 adicionais por projeto; portfólio: nome 100, descrição 2000; projeto: nome 120, descrição 5000, URL 2048. Centralizado em `src/config/media.ts`, `validation/*` e espelhado em `*.rules`.

## ADR-012 — Cache e offline
**Status:** proposta. Firestore com cache **em memória** (sem IndexedDB) e logout com recarga. **Por quê:** dispositivos compartilhados e troca de usuário (doc. de segurança) sem depender de limpeza de cache persistente. **Consequência:** dados já carregados na sessão podem ser lidos offline; **não há** leitura offline após recarregar a página nem fila de gravações pendentes (gravações ficam desabilitadas offline, com aviso). Isso fica **aquém** do desejado em "consultar dados previamente carregados / sincronizar pendências": para entregá-lo, trocar para `persistentLocalCache` (com `persistentMultipleTabManager`) e definir a política de limpeza ao sair — **requer sua decisão**.

## ADR-013 — Imagens por URL de download
**Status:** proposta. Guardar `path` + `url` no documento; exibir com `<img>`. Ver risco em SEGURANCA.md.

## Ainda sem decisão
Perfil básico do usuário (nome/foto editáveis), campos "tecnologias" e "período" de projeto, hospedagem/CI/CD, ambientes dev/homologação/produção, E2E com Playwright, publicação pública.
