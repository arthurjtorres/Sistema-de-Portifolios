# Segurança e regras

A interface nunca é a autoridade. Toda a autorização está em `firestore.rules` e `storage.rules`, com negação por padrão.

## Firestore (`firestore.rules`)

- Só existem regras para `users/{uid}/portfolios/*` e `users/{uid}/projects/*`; qualquer outro caminho é negado.
- Leitura/escrita exigem `request.auth.uid == uid` do caminho.
- **Create/update** validam: conjunto exato de campos, `ownerId == uid` (impede trocar o proprietário), tipos, limites (nome 100/120, descrição 2000/5000, até 8 imagens, URL `http(s)` até 2048), referências de imagem apontando só para `users/{uid}/…`, `createdAt` imutável, `updatedAt == request.time` (exceto reordenação, em que só `sortOrder` muda).
- **Projeto → portfólio**: o projeto só é aceito se `users/{uid}/portfolios/{portfolioId}` existir (mesmo usuário). Isso impede vincular a portfólio de terceiros mesmo contornando o cliente.
- Delete: apenas o dono. A regra **não** impede excluir um portfólio com projetos (o bloqueio é do cliente, ADR-009); a regra não consegue consultar coleções.

## Storage (`storage.rules`)

- Caminho `users/{uid}/{portfolios|projects}/{id}/{arquivo}`; leitura, criação e exclusão só pelo dono.
- Criação: `image/jpeg|png|webp` e até 5 MB. SVG e GIF são rejeitados (SVG pode carregar script).
- Arquivos são imutáveis (`update` negado): substituir = novo nome + excluir o antigo.
- **Limites duplicados**: `src/config/media.ts` e `storage.rules` precisam ser mantidos juntos.

## Pontos de atenção

- **URLs de download** (`getDownloadURL`) contêm um token de acesso: quem tem o link vê a imagem, independentemente das regras. São guardadas no documento do dono. É um compromisso para exibir imagens com `<img>` simples (ADR-013); alternativa futura: URLs assinadas por backend.
- Firestore não valida que o arquivo referenciado existe no Storage; o cliente garante a ordem (upload → gravação) e faz limpeza em caso de falha.
- Excluir documento não apaga arquivos automaticamente: o `service` apaga os arquivos após o documento; falhas são registradas e (na edição) sinalizadas ao usuário. Objetos órfãos eventuais exigiriam rotina de limpeza (Cloud Function), fora do escopo.
- Segredos: apenas configuração pública `VITE_`; `.env*` ignorados pelo git (exceto `.env.example`).
- Logout recarrega a página e o Firestore usa cache em memória: nada do usuário anterior persiste em disco (ADR-012).
- Recuperação de senha não revela se um e-mail possui conta.

## Testes das regras

`tests/rules/` (rodam com `npm run test:rules`): visitante negado; usuário B negado em leitura/listagem/criação/edição/exclusão em dados de A; troca de `ownerId`; campos extras e valores inválidos; capa de outro usuário; projeto em portfólio inexistente ou de terceiros; limites de galeria e URL; reordenação; Storage: pasta alheia, tipos proibidos, 5 MB (limite exato e +1), caminhos fora do modelo, exclusão por terceiros.
