# Checklist de Homologação — Hub Administrativo

## Pré-condições
- Ambiente com variáveis Firebase e SMTP configuradas.
- `LUCCA_DEFAULT_WORKSPACE_USER_ID` definido.
- Regras/índices Firestore publicados.

## Cenário 1 — Lead Análise
- [ ] Lead entra pelo chat Lucca.
- [ ] Cria/atualiza empresa em `crm_accounts`.
- [ ] Cria contato em `crm_contacts` sem duplicação indevida.
- [ ] Cria oportunidade em `crm_deals`.
- [ ] Cria tarefa em `executive_tasks`.
- [ ] Cria interação em `crm_interactions`.

## Cenário 2 — Funil
- [ ] Oportunidade avança de estágio sem perder dados.
- [ ] Próxima ação e responsável permanecem íntegros.

## Cenário 3 — Financeiro
- [ ] Receita sem negócio relacionado é bloqueada.
- [ ] Saldo, receitas, custos e pendências batem com lançamentos.

## Cenário 4 — Operação Lucca
- [ ] Tarefa muda de status em sequência válida.
- [ ] Priorização reflete score e urgência.
- [ ] Tarefas críticas e atrasadas aparecem nos indicadores.

## Cenário 5 — E-mail
- [ ] Envio bem-sucedido grava `deliveryStatus=sent`.
- [ ] Falha grava `deliveryStatus=failed` + `deliveryError`.
- [ ] Retentativa automática executa quando primeira tentativa falha.

## Cenário 6 — Segurança
- [ ] Conta não autorizada sem acesso ao painel.
- [ ] Leitura/escrita fora do workspace bloqueada pelas rules.

## Saúde operacional
- [ ] `GET /api/admin/health` retorna `ok=true`.
- [ ] Todas as coleções críticas retornam probe sem erro.

## Critério de aprovação
Homologado apenas se todos os itens acima estiverem concluídos.
