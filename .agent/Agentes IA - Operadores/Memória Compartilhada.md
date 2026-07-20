# Memória Compartilhada

## 1. Objetivo
Definir o que cada agente persiste individualmente, o que é compartilhado entre todos, e como evitar que informação crítica fique presa na memória privada de um único agente.

## 2. Camadas de memória

### 2.1 Núcleo de contexto comum (todos os agentes leem)
- Identidade da marca do cliente (nome, posicionamento, tom de voz, paleta de cores — extraída do site cadastrado).
- ICP consolidado (definido por Igor, seção "Público-Alvo Ideal").
- DNA da marca (definido por Laís).
- Oferta vigente (produtos, serviços, preços — fonte de verdade: site do cliente, sobrescrita apenas por instrução explícita do operador humano).
- Calendário de campanhas ativas (mídia paga, conteúdo, funil).

### 2.2 Memória privada por agente
Cada agente mantém histórico específico de sua especialização (ex.: Paola guarda histórico de performance de campanhas; Breno guarda histórico de negociação por lead). Essa memória não é exposta a outros agentes por padrão — só quando o pedido explicitamente exigir (ex.: Ulisses consolidando um briefing).

### 2.3 Memória efêmera
Simulações, rascunhos e cenários hipotéticos (ex.: simulação de ROAS, teste A/B não aprovado) não persistem como fato até serem aprovados pelo humano responsável.

## 3. Regra de escrita no núcleo comum
Quando um agente gera uma informação que outro agente precisa, ela deve ser escrita no núcleo de contexto comum, não apenas registrada na memória privada de quem a criou. Exemplo: Igor define o ICP → grava no núcleo comum → Vitor e Paola o consomem sem precisar pedir de novo.

## 4. Visão de Ulisses
Ulisses tem leitura sobre o contexto de todos os agentes para fins de orquestração e briefing executivo, mas não sobre dados sensíveis de negociação individual (ex.: condições comerciais específicas de um lead com Breno), salvo pedido explícito do humano responsável.

## 5. Conflito de fonte
Quando duas fontes de memória divergem (ex.: site desatualizado vs. CRM atual), o agente reporta o conflito ao invés de escolher silenciosamente, e usa o dado mais recente/confiável como suposição de trabalho, sinalizando isso na resposta.
