# Guia de Renovação Automática de Tokens

Este documento descreve como os tokens de acesso são renovados automaticamente no NeuroAds Hub para evitar interrupções no carregamento de dados.

## 🔄 Como Funciona

Toda vez que o dashboard faz uma requisição para extrair dados de tráfego (`/api/traffic/extract`), o sistema:

1. Verifica se cada token está prestes a expirar (5 minutos de margem)
2. Se expirando, tenta renovar automaticamente usando o refresh token ou credenciais da plataforma
3. Salva o novo token no Firestore
4. Usa o token renovado para fazer a requisição à API da plataforma

## 🔑 Tokens por Plataforma

### Google Ads, Google Analytics 4, Search Console
- **Tipo:** OAuth 2.0 com refresh token
- **Expiração:** Access token válido por 1 hora
- **Renovação:** Automática via `https://oauth2.googleapis.com/token`
- **Status:** ✅ Implementado e funcionando
- **Variáveis necessárias:**
  - `GOOGLE_ADS_CLIENT_ID`
  - `GOOGLE_ADS_CLIENT_SECRET`
  - `GOOGLE_ADS_DEVELOPER_TOKEN`

### LinkedIn Ads, LinkedIn Page
- **Tipo:** OAuth 2.0 com refresh token
- **Expiração:** Access token válido por ~1 mês
- **Renovação:** Automática via `https://www.linkedin.com/oauth/v2/accessToken`
- **Status:** ✅ Implementado e funcionando
- **Variáveis necessárias:**
  - `LINKEDIN_ADS_CLIENT_ID`
  - `LINKEDIN_ADS_CLIENT_SECRET`

### Meta Ads (Facebook Marketing API) ⭐ NOVO
- **Tipo:** OAuth 2.0 com token de longa vida
- **Expiração:** Access token válido por ~60 dias
- **Renovação:** ✅ Agora automática via `fb_exchange_token` flow
- **Status:** Implementado a partir da v2.0 (este sprint)
- **Variáveis necessárias:**
  - `META_APP_ID`
  - `META_APP_SECRET` ⚠️ **CRÍTICO** - sem isso, não há renovação
- **Passo a passo para configurar:**
  1. Acesse https://developers.facebook.com/
  2. Abra seu App
  3. Vá em **Settings > Basic**
  4. Copie o **App Secret** (pode estar oculto, clique para revelar)
  5. Cole em `.env.local`: `META_APP_SECRET="app_secret_aqui"`
  6. Reinicie o servidor

## 🔍 Verificar Status de Renovação

### No Firestore
Cada conexão de usuário é armazenada em `users/{uid}/connections/{platform}`:

```json
{
  "isActive": true,
  "accessToken": "token_aqui",
  "refreshToken": "refresh_token_aqui",
  "expiresAt": 1720000000000,  // timestamp em ms
  "updatedAt": 1719500000000    // última renovação
}
```

### No console do servidor
Observe os logs ao fazer requisições:

```
✓ Successfully refreshed access token for metaAds (user123)
```

ou

```
✗ Failed to refresh token for metaAds of user user123: Meta app token generation failed.
```

## 🚨 Troubleshooting

### "Meta token refresh failed"
**Causa:** App Secret não configurado ou incorreto  
**Solução:**
1. Verifique se `META_APP_SECRET` está em `.env.local`
2. Confirme que é a mesma chave do dashboard Meta for Developers
3. Reinicie o servidor com `npm run dev`

### "Token expirado" mesmo com renovação ativa
**Causa:** Refresh token do usuário é inválido ou foi revogado  
**Solução:**
1. Usuário deve reconectar a integração em `/hub/integracoes`
2. A reconexão gera um novo refresh token válido

### Dashboard mostra R$ 0,00 de investimento
**Causa:** Token expirou e não foi renovado (geralmente Meta)  
**Solução:**
1. Verifica se há banner de erro vermelho no topo
2. Clique em "Resolver Agora"
3. Reconecte a integração

## 📊 Fluxo Completo de Renovação (Meta Ads)

```
Dashboard carrega → POST /api/traffic/extract
    ↓
Servidor checa expiresAt do token Meta
    ↓
Token está expirado? SIM
    ↓
Step 1: Gera app access token
    GET https://graph.facebook.com/oauth/access_token
    Params: client_id, client_secret, grant_type=client_credentials
    ↓
Step 2: Troca user token por long-lived token
    GET https://graph.facebook.com/oauth/access_token
    Params: grant_type=fb_exchange_token, client_id, client_secret, fb_exchange_token=token_antigo
    ↓
Step 3: Salva novo token no Firestore
    newExpiresAt = now + 60 dias
    ↓
Step 4: Usa novo token para extrair dados
    POST https://graph.facebook.com/v20.0/{account_id}/insights
    ↓
Dashboard mostra dados reais ✓
```

## 🔒 Segurança

- **App Secret nunca é enviado para o cliente** — apenas roteado no servidor
- **Tokens antigos são sobrescritos** — sem histórico
- **Expiração é verificada antes de usar** — margem de 5 minutos
- **Fallback:** Se renovação falhar, tenta com token antigo mesmo assim

## 📅 Roadmap Futuro

- [ ] Implementar renovação para Instagram (usa mesmo app que Meta Ads)
- [ ] Adicionar exponential backoff para retries
- [ ] Dashboard com histórico de renovações/falhas
- [ ] Alertas proativos antes de expiração (7 dias)
