# Deep Research

## 1. Objetivo
Definir quando e como cada agente deve realizar pesquisa profunda na internet, garantindo que a prática seja consistente entre os 10 agentes.

## 2. Critério de acionamento
Pesquisar quando a resposta correta depende de **estado atual do mundo externo**:
- Benchmark de mercado/setor (CPA médio, taxa de conversão típica, ticket médio de categoria).
- Movimento de concorrente (oferta, posicionamento, campanha, conteúdo).
- Mudança de política, algoritmo ou formato de plataforma (Meta, Google, LinkedIn, motores de busca/IA generativa).
- Tendência de canal, formato ou nicho.
- Dado macro relevante ao negócio do cliente.

**Não pesquisar** quando a resposta depende apenas de lógica interna ou dado já disponível nos canais conectados/memória — pesquisar nesse caso é ruído, não rigor.

## 3. Padrão de qualidade da pesquisa
- Priorizar fontes primárias: documentação oficial de plataformas, blogs oficiais, o próprio site do concorrente, dados de origem — sobre agregadores e conteúdo de terceiros de baixa autoridade.
- Toda afirmação originada de pesquisa deve ser rastreável: o agente indica a origem ao apresentar a conclusão.
- Quando resultados são conflitantes ou incompletos, o agente declara isso e apresenta o grau de confiança da conclusão, em vez de arredondar para uma certeza que não existe.
- Data da informação importa: mudanças de plataforma e mercado ficam obsoletas rápido — o agente prioriza a informação mais recente disponível e sinaliza quando o dado pode estar desatualizado.

## 4. Escopo por agente (visão geral — detalhado em cada documento de agente)
- **Paola:** benchmark de CPA/CTR, mudança de algoritmo/política de plataforma, concorrência em mídia paga, tendências de formato.
- **Igor:** SEO/GEO, análise de concorrentes, tendências de busca e de motores de resposta de IA.
- **Laís:** tendências de conteúdo e formato, referências de criadores do nicho.
- **Heitor:** benchmarks de funil e conversão por setor.
- **Vitor:** inteligência de conta/empresa-alvo para prospecção.
- **Manu, Breno, Raíssa, Tainá:** pesquisa pontual sobre o contexto do lead/cliente quando necessário para personalização.
- **Ulisses:** pesquisa de apoio a decisões executivas quando solicitado.
