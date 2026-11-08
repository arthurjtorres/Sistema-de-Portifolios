# Configuração do Firebase

Nada deste repositório altera recursos reais do Firebase. Os passos abaixo são manuais e feitos por você.

## 1. Projeto e app Web

1. Console Firebase → criar projeto (recomenda-se um para desenvolvimento e outro para produção; ADR de ambientes pendente).
2. Configurações do projeto → Seus apps → adicionar app **Web** → copiar os 6 valores para `.env.local` (ver README).

## 2. Authentication

Build → Authentication → Começar → **E-mail/senha** → Ativar. (Opcional: personalizar o modelo do e-mail de redefinição de senha.) Em Configurações → Domínios autorizados, inclua o domínio de hospedagem em produção.

## 3. Firestore

Build → Firestore Database → criar banco (escolha a região com cuidado: não muda depois). Publique as regras e índices **após revisar** [SEGURANCA.md](SEGURANCA.md):

```powershell
npx firebase login
npx firebase use --add          # associa o projeto (cria .firebaserc local, ignorado pelo git)
npx firebase deploy --only firestore:rules,firestore:indexes
```

Índices: nenhum composto é necessário. As consultas usam um único `orderBy` (`sortOrder` ou `updatedAt`) ou `where portfolioId ==` com ordenação no cliente.

## 4. Storage

Build → Storage → Começar (o bucket exige o plano Blaze em projetos novos). Depois:

```powershell
npx firebase deploy --only storage
```

## 5. Emuladores (sem custo e sem tocar no projeto real)

`npm run emulators` sobe Auth (9099), Firestore (8080), Storage (9199) e a UI (4000), com o projeto fictício `demo-portfolio-manager`. Requer Java instalado.

## 6. Custos e monitoramento (Blaze)

Configure alertas de orçamento no Google Cloud Billing. O app evita listeners contínuos e usa contagens agregadas para reduzir leituras; monitore leituras/gravações/downloads no console após o uso real.

## Itens que dependem de você

Criar o projeto, ativar o provedor de e-mail/senha, criar Firestore e Storage, preencher `.env.local`, fazer o deploy das regras. Nenhum deploy foi executado.
