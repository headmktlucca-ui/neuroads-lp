---
name: packaging-hostinger-deploy
description: Use when o usuário pede para "gerar o zip", "criar pacote da Hostinger", "empacotar para deploy", "subir para a Hostinger" ou preparar o build da NeuroAds LP para hospedagem — empacota o projeto Next.js em dist/deploy-hostinger.zip excluindo node_modules/.next/segredos, pronto para upload no hPanel ou VPS.
---

# Packaging Hostinger Deploy

## Visão geral

Gera `dist/deploy-hostinger.zip` com o código-fonte do frontend Next.js pronto para upload na Hostinger (Node.js / VPS). O zip **não** contém build compilado: o `npm install` + `npm run build` rodam no servidor. O mecanismo canônico é o script `scripts/ops/create-hostinger-zip.ps1`, exposto como `npm run ops:zip-hostinger`. Esta skill orquestra o processo — não reimplemente o zip do zero.

## Quando usar

- Pedidos: "cria o zip da Hostinger", "gera o pacote de deploy", "prepara pra subir".
- Antes de um deploy manual via File Manager do hPanel.
- Para regenerar `dist/deploy-hostinger.zip` após mudanças no código.

**Não usar para:** deploy via `git clone` na VPS (nesse fluxo não há zip — veja `DEPLOY_HOSTINGER.md`).

## Procedimento

Executar em ordem, a partir da raiz do projeto (`C:\Users\claud\OneDrive\Documentos\NeuroAds\LP`):

1. **Validar o build antes de empacotar.** Pega erros de TypeScript/lint que quebrariam o build no servidor:
   ```powershell
   npm run build
   ```
   Se falhar, corrigir antes de gerar o zip — não empacotar código que não compila.

2. **Gerar o zip:**
   ```powershell
   npm run ops:zip-hostinger
   ```
   Isso roda `scripts/ops/create-hostinger-zip.ps1`, que sobrescreve `dist/deploy-hostinger.zip`.

3. **Confirmar a saída** e reportar o caminho e o tamanho ao usuário:
   ```powershell
   Get-Item dist\deploy-hostinger.zip | Select-Object Name, @{n='MB';e={[math]::Round($_.Length/1MB,2)}}, LastWriteTime
   ```

## O que entra e o que fica de fora

O script inclui a raiz do projeto **exceto**:

| Excluído | Motivo |
|----------|--------|
| `.git/`, `.claude/`, `.claire/`, `.agent/`, `.superpowers/`, `.vscode/` | Metadados de dev/ferramentas |
| `node_modules/` | Reinstalado no servidor (`npm install`) |
| `.next/` | Recompilado no servidor (`npm run build`) |
| `dist/` | Evita empacotar o próprio zip |
| `.firebase/`, `logs/`, `docs/`, `my-video/`, `temp-app/` | Não vão para produção |
| `.env.local` | **Segredo de dev — nunca sobe** |
| `*.log`, `*.tsbuildinfo`, `*.tmp`, `tmp_*`, `server.pid`, `*.zip/.rar/.tar/.gz` | Lixo/temporários |

**Atenção:** `.env.production` **é incluído** (apenas `.env.local` é excluído). Confirmar que ele contém as chaves corretas do Firebase de produção antes de empacotar. Ver `DEPLOY_HOSTINGER.md` seção 2.

## Depois do upload (no servidor Hostinger)

Após subir e extrair o zip no hPanel/VPS:
```bash
npm install
npm run build
npm run start        # Startup Command no painel Node.js
```
Validar assets em produção:
```powershell
npm run ops:check-prod-assets -- https://neuroads.com.br
```
Qualquer `404` em `/_next/static/*` = limpar cache de CDN da Hostinger e reiniciar a app.

## Erros comuns

- **Zip enorme (~300 MB):** esperado — inclui `public/` com imagens/vídeos. Não é bug. Se precisar reduzir, revisar assets pesados em `public/`, não mexer no script.
- **`ops:zip-hostinger` falha com política de execução:** o `npm run` já passa `-ExecutionPolicy Bypass`. Se rodar o `.ps1` direto, usar `powershell -ExecutionPolicy Bypass -File scripts/ops/create-hostinger-zip.ps1`.
- **Empacotou sem `.env.production`:** app quebra no login (Firebase). Verificar que o arquivo existe na raiz antes do passo 2.
- **Atalho manual:** `CRIAR-ZIP-HOSTINGER.bat` (duplo-clique) faz o mesmo que o passo 2 e abre a pasta `dist/`.

## Recursos

- `scripts/ops/create-hostinger-zip.ps1` — script canônico do zip (mecanismo real; parametrizável via `-OutputFile`).
- `DEPLOY_HOSTINGER.md` — guia completo de deploy (Firebase, hPanel, VPS, DNS, SSL).
- `CRIAR-ZIP-HOSTINGER.bat` — atalho clicável para gerar o zip.
