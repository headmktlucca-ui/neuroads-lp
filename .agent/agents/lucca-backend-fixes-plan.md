# Plano de Ação Técnico: Correções do Backend (NestJS)

**Data:** 24 de Março de 2026
**Objetivo:** Resolver todos os erros de compilação do TypeScript no backend do Lucca, garantindo que o build passe com sucesso no Render.
**Autor:** Agente Lucca

Este documento detalha as correções exatas que o desenvolvedor (Antigravity) deve aplicar no repositório `headmktlucca-ui/lucca.neuroads`.

---

## 1. Módulo Knowledge (`src/modules/knowledge/`)

### 1.1. Erro de Import do Guard Inexistente
**Arquivo:** `backend/src/modules/knowledge/knowledge.controller.ts`
**Erro:** `Cannot find module '../auth/jwt-auth.guard'`
**Análise:** O módulo de auth atual não exporta um `JwtAuthGuard` padrão nesse caminho. O controller está tentando importá-lo mas não o utiliza (está comentado ou apenas no import).
**Ação:** Remover o import da linha 15.

```typescript
// ANTES (Linha 15)
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// DEPOIS
// Remover a linha completamente.
```

### 1.2. Erro de Schema Prisma no EmbeddingService
**Arquivo:** `backend/src/modules/knowledge/embedding.service.ts`
**Erro:** `Property 'create' does not exist on type 'DocumentEmbeddingDelegate...'` e erros de tipagem em `updateKnowledgeBaseStats`.
**Análise:** O código (versão antiga ou cacheada) tentava usar `this.prisma.documentEmbedding`, mas o schema atual usa o modelo `DocumentChunk`. O método `updateKnowledgeBaseStats` não existe no `KnowledgeService` atual, pois os stats são calculados sob demanda.
**Ação:** O código atual no servidor já parece usar `DocumentChunk` nas linhas corretas (verificado via shell), mas o erro persiste no log de build devido ao cache do Prisma Client ou versão antiga. 
**Correção Definitiva:**
1. Garantir que o `embedding.service.ts` usa `documentChunk` na linha de criação:
```typescript
        // Save Chunk
        await (this.prisma as any).documentChunk.create({
          data: {
            documentId,
            companyId,
            knowledgeBaseId: document.knowledgeBaseId!, 
            chunkIndex: index,
            content: chunk,
            tokens: Math.ceil(chunk.length / 4),
            embedding: `[${embedding.join(',')}]` as any,
          },
        });
```
2. **CRÍTICO:** O erro real no ambiente de build é o Prisma Client desatualizado. É obrigatório rodar `npx prisma generate` antes do build.

---

## 2. Módulo Gemini Context (`src/modules/gemini/context.service.ts`)

### 2.1. Erros de Relações Inexistentes no Prisma Include
**Arquivo:** `backend/src/modules/gemini/context.service.ts`
**Erros:** `Property 'campaigns' does not exist on type...`, `Property 'socialPosts' does not exist on type...`
**Análise:** O `context.service.ts` tenta incluir `campaigns`, `socialPosts` e `documents` ao buscar a `Company`. No entanto, o Prisma Client gerado não reconhece essas propriedades, seja porque elas foram removidas/renomeadas no schema ou porque o cliente está desatualizado.
No `schema.prisma` atual:
- `socialPosts` **existe**.
- `documents` **existe**.
- `campaigns` **NÃO EXISTE**. Foi removido e substituído por `integrationGoogleAds`, `integrationMetaAds`, etc.

**Ação Exata:**
Modificar a busca da empresa (por volta da linha 45) para usar as relações corretas:

```typescript
// ANTES
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: {
          brandProfile: true,
          documents: true,
          socialPosts: { take: 5, orderBy: { createdAt: 'desc' } },
          campaigns: { where: { status: 'Active' } }, // ISSO CAUSA ERRO
          integrations: true, // ISSO TAMBÉM PODE CAUSAR ERRO SE NÃO EXISTIR
        },
      });

// DEPOIS
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        include: {
          brandProfile: true,
          documents: true,
          socialPosts: { take: 5, orderBy: { createdAt: 'desc' } },
          integrationGoogleAds: true,
          integrationMetaAds: true,
          integrationGoogleAnalytics: true,
        },
      });
```
*Nota: O código atual no repositório já parece ter parte dessa correção, mas o build falha. O desenvolvedor deve confirmar que as propriedades removidas (`campaigns`, `integrations` genérico) não estão sendo chamadas nas linhas 79, 83, 102, 115 e 154 do `context.service.ts`.*

---

## 3. Módulo Integrations (`src/modules/integrations/integrations.service.ts`)

### 3.1. Erro de Union Type Não Chamável
**Arquivo:** `backend/src/modules/integrations/integrations.service.ts` (Linha 1897)
**Erro:** `This expression is not callable. Each member of the union type...`
**Análise:** O TypeScript reclama ao tentar fazer `(this.prisma as any)[mod].findUnique(...)` onde `mod` é inferido como uma string literal de vários modelos possíveis. O TypeScript restrito não permite chamar um método em uma união de tipos não relacionados sem type assertion clara.
**Ação:** Usar um cast mais agressivo para ignorar o erro do TypeScript, já que a lógica em runtime funciona (é um bypass de tipagem).

```typescript
// ANTES (aprox. linha 1895)
    const attemptFind = async (mod: typeof modelName, prov: string) => {
      if (!mod) return null;
      const res = await (this.prisma as any)[mod].findUnique({
        where: { id: integrationId },
        include: { company: true },
      });
      // ...

// DEPOIS
    const attemptFind = async (mod: string, prov: string) => {
      if (!mod) return null;
      const delegate = (this.prisma as any)[mod];
      const res = await delegate.findUnique({
        where: { id: integrationId },
        include: { company: true },
      });
      // ...
```

---

## 4. Módulos SEO e Social (`src/modules/seo/seo.service.ts` e `social.service.ts`)

### 4.1. Erro de Atribuição de 'provider' a Tipos que Não o Possuem
**Arquivos:** `seo.service.ts` (linhas 302, 318) e `social.service.ts` (linhas 741, 1096, 1785)
**Erro:** `Property 'provider' does not exist on type...` ou `Argument of type ... is not assignable to parameter of type 'never'`.
**Análise:** O código tenta injetar uma propriedade dinâmica `provider` em objetos retornados pelo Prisma que têm uma tipagem estrita (onde `provider` não existe).
**Ação:** Fazer o cast do objeto retornado pelo Prisma para `any` ou um tipo estendido antes de adicionar a propriedade.

**Exemplo no `seo.service.ts` (linha ~300):**
```typescript
// ANTES
    if (ga4) integrations.push({ ...ga4, provider: 'GoogleAnalytics' });
    if (gsc) integrations.push({ ...gsc, provider: 'GoogleSearchConsole' });

// DEPOIS
    if (ga4) integrations.push({ ...(ga4 as any), provider: 'GoogleAnalytics' });
    if (gsc) integrations.push({ ...(gsc as any), provider: 'GoogleSearchConsole' });
```

**Exemplo no `social.service.ts`:**
Onde quer que o código tente ler ou escrever `integration.provider`, garantir que a variável está tipada como `any`.
```typescript
// Exemplo genérico da correção
const integrationProvider = (integration as any).provider;
```

---

## 5. Ordem de Execução e Validação

Para garantir que as correções funcionem no ambiente de produção (Render), siga esta ordem:

1. **Atualizar o Prisma Client Localmente:**
   Antes de testar, rode `npx prisma generate` na pasta `backend/` para garantir que os tipos locais refletem o banco de dados.
2. **Aplicar as correções de código:**
   Modifique os arquivos `.ts` conforme detalhado nas seções 1 a 4.
3. **Validar o Build Localmente:**
   Rode `npm run build` dentro da pasta `backend/`. O build **deve** terminar sem erros do tipo `TS2339` ou `TS2345`.
4. **Commit e Push:**
   Envie as alterações para a branch `main`. O Render deve iniciar o deploy automaticamente.
5. **Verificar Render Logs:**
   Acompanhe o log de build no Render para confirmar que a etapa `nest build` passou com sucesso.
