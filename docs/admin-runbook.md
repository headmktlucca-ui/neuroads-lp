# Runbook Operacional — Hub Administrativo NeuroAds

## Objetivo
Garantir operação diária estável do Hub Administrativo (CRM, Funil, Lucca e Financeiro) sem dependência de ação manual fora do processo padrão.

## Rotina diária (início)
1. Acessar `/admin` com conta autorizada.
2. Validar saúde do backend:
   - `GET /api/admin/health`
   - Esperado: `ok=true`.
3. Verificar alertas operacionais no topo do painel:
   - receitas sem negócio vinculado
   - pendências com vencimento
4. Verificar fila Lucca:
   - tarefas críticas
   - tarefas atrasadas
   - tarefas vencendo hoje

## Rotina comercial
1. Revisar novos leads em CRM/Contatos.
2. Confirmar se cada lead tem:
   - nome
   - canal de retorno (email/telefone)
   - oportunidade no funil
3. Atualizar estágio do funil e próxima ação.

## Rotina de comunicação
1. Priorizar envio por e-mail direto da Central Lucca.
2. Caso falha de envio:
   - validar `deliveryStatus=failed` em `crm_interactions`
   - reenviar pelo painel
3. Se falhar novamente, abrir incidente operacional interno.

## Rotina financeira
1. Conferir receitas e custos do dia.
2. Confirmar que toda `Receita` tem negócio relacionado.
3. Atualizar status de lançamentos (`Previsto`, `Pago`, `Atrasado`).

## Incidentes e fallback
## Health check com falha
1. Verificar variáveis de ambiente principais.
2. Verificar permissão/regras Firestore publicadas.
3. Verificar latência do Firebase e logs de erro.

## Falha contínua de e-mail
1. Validar credenciais SMTP.
2. Validar se o domínio/caixa de envio está ativo.
3. Confirmar registro de falha em `crm_interactions`.
4. Escalar internamente para correção de infraestrutura.

## Auditoria mínima obrigatória
Todas as entidades críticas devem manter:
- `source`
- `createdBy`
- `createdAt`
- `updatedAt`

## Backup e recuperação
1. Export periódico do Firestore.
2. Armazenamento do backup em local seguro.
3. Teste de restauração em ambiente de homologação.
