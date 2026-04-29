# Stripe - Cadastro de Agentes

Este diretório contém o script para cadastrar/atualizar no Stripe:
- 1 produto por Agente
- 3 preços recorrentes mensais por Agente (`Lite`, `Growth`, `Pro`)
- metadados com `categoria`, `tier` e `limite de execuções`

## 1) Configurar variáveis de ambiente

No `.env.local`, configure:

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_AGENT_SYNC_DRY_RUN=false
```

## 2) Rodar sincronização

```bash
npm run stripe:sync-agents
```

## 3) Resultado

O script gera/atualiza:
- Produtos e preços no Stripe (idempotente por `lookup_key`)
- Arquivo local com o mapeamento:
  - `src/data/stripe-agent-price-ids.json`

Esse arquivo contém os `priceId` por Agente e por plano.

## 4) Modo simulação (sem criar no Stripe)

```bash
STRIPE_AGENT_SYNC_DRY_RUN=true npm run stripe:sync-agents
```

No PowerShell:

```powershell
$env:STRIPE_AGENT_SYNC_DRY_RUN='true'
npm run stripe:sync-agents
```

## Observações

- A troca de preço futuro deve ser feita criando novo `Price` e reapontando `lookup_key` (o script já faz isso com `transfer_lookup_key`).
- Checkout atual usa `priceId`; você pode consumir o JSON gerado para preencher os IDs dinamicamente.
