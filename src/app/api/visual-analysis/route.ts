import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({
        success: false,
        error: "URL do site não informada.",
        details: "O parâmetro 'url' é obrigatório para realizar a análise visual real.",
        troubleshoot: [
          "Certifique-se de que a empresa ativa possui um site cadastrado nas Configurações.",
          "Verifique se o site cadastrado é um endereço web válido."
        ]
      }, { status: 400 });
    }

    // Normalizar a URL
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    let html = "";
    try {
      // Configurar timeout de 6 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`O servidor do site respondeu com código HTTP ${response.status} (${response.statusText}).`);
      }

      html = await response.text();
    } catch (fetchError: unknown) {
      const err = fetchError as Error;
      let friendlyMessage = "Não foi possível acessar a URL informada.";
      let details = err.message || "Erro de conexão desconhecido.";
      
      if (err.name === 'AbortError') {
        friendlyMessage = "Tempo de resposta esgotado (Timeout).";
        details = "O servidor do site demorou mais de 6 segundos para responder.";
      } else if (details.includes("ENOTFOUND") || details.includes("dns")) {
        friendlyMessage = "Endereço do site não encontrado (Erro de DNS).";
        details = "Não foi possível resolver o nome do domínio. Verifique a grafia da URL.";
      } else if (details.includes("ECONNREFUSED")) {
        friendlyMessage = "Conexão recusada pelo servidor do site.";
        details = "O servidor de destino recusou ativamente a conexão na porta 80 ou 443.";
      }

      return NextResponse.json({
        success: false,
        error: friendlyMessage,
        details,
        troubleshoot: [
          "Verifique se o endereço do site está digitado corretamente nas Configurações (ex: seusite.com.br).",
          "Garanta que o site esteja no ar e possa ser acessado publicamente através de qualquer navegador.",
          "Verifique se o seu servidor não está bloqueando acessos automatizados (bots) ou requisições de servidores em nuvem (ex: Cloudflare protection)."
        ]
      }, { status: 502 });
    }

    // ─── Extração de Indicadores via Regex ───
    
    // 1. Focal Point Clarity (presença e clareza de imagens e elementos estruturais)
    const imgMatches = html.match(/<img\b[^>]*>/gi) || [];
    const imgCount = imgMatches.length;
    const hasHeader = /<header\b[^>]*>/i.test(html) || /class=["'][^"']*(header|nav)[^"']*["']/i.test(html);
    const hasHero = /class=["'][^"']*(hero|banner|intro)[^"']*["']/i.test(html);
    
    let focalPointScore = 50;
    if (hasHeader) focalPointScore += 10;
    if (hasHero) focalPointScore += 15;
    focalPointScore += Math.min(25, imgCount * 5);
    focalPointScore = Math.min(100, Math.max(20, focalPointScore));

    // 2. CTA Visibility (presença e realce de botões de conversão)
    const ctaMatches = html.match(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi) || [];
    const ctaKeywords = [
      'quero', 'comprar', 'cadastrar', 'planos', 'assinar', 'teste', 'grátis', 'gratis',
      'falar', 'contato', 'obter', 'assine', 'comece', 'agora', 'saiba mais', 'demonstração', 'demo'
    ];
    
    let ctaKeywordsMatch = 0;
    ctaMatches.forEach(cta => {
      const text = cta.replace(/<[^>]*>/g, '').toLowerCase();
      ctaKeywords.forEach(kw => {
        if (text.includes(kw)) ctaKeywordsMatch++;
      });
    });

    let ctaVisibilityScore = 40;
    ctaVisibilityScore += Math.min(45, ctaKeywordsMatch * 9);
    if (ctaMatches.length > 0) ctaVisibilityScore += 15;
    ctaVisibilityScore = Math.min(100, Math.max(20, ctaVisibilityScore));

    // 3. Info Hierarchy (hierarquização estrutural do texto h1 > h2 > h3)
    const h1Count = (html.match(/<h1\b[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2\b[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3\b[^>]*>/gi) || []).length;

    let infoHierarchyScore = 50;
    if (h1Count === 1) {
      infoHierarchyScore += 25; // Perfeito: um único título principal
    } else if (h1Count > 1) {
      infoHierarchyScore += 10; // Múltiplos H1s são aceitáveis mas não ideais
    } else {
      infoHierarchyScore -= 10; // Sem H1
    }
    if (h2Count > 0) infoHierarchyScore += 15;
    if (h3Count > 0) infoHierarchyScore += 10;
    infoHierarchyScore = Math.min(100, Math.max(20, infoHierarchyScore));

    // 4. Minimize Distractions (ausência de elementos poluídos/scripts excessivos)
    const scriptCount = (html.match(/<script\b[^>]*>/gi) || []).length;
    const iframeCount = (html.match(/<iframe\b[^>]*>/gi) || []).length;

    let distractionScore = 100;
    distractionScore -= Math.min(30, scriptCount * 1.5);
    distractionScore -= Math.min(30, iframeCount * 10);
    if (imgCount > 12) distractionScore -= Math.min(20, (imgCount - 12) * 2);
    distractionScore = Math.min(100, Math.max(20, distractionScore));

    const criteria = [
      {
        key: 'focal_point',
        label: 'Focal Point Clarity',
        score: focalPointScore,
        level: focalPointScore >= 75 ? 'high' : focalPointScore >= 50 ? 'medium' : focalPointScore >= 25 ? 'low' : 'none',
        description: 'Clareza do ponto focal principal da página com base no contraste e hero elements.',
        recommendation: 'Garanta que o título principal e a imagem de hero se destaquem em relação aos demais elementos.',
        passed: focalPointScore >= 70
      },
      {
        key: 'cta_visibility',
        label: 'CTA Visibility',
        score: ctaVisibilityScore,
        level: ctaVisibilityScore >= 75 ? 'high' : ctaVisibilityScore >= 50 ? 'medium' : ctaVisibilityScore >= 25 ? 'low' : 'none',
        description: 'Destaque e texto focado em conversão dos botões de chamada para ação encontrados.',
        recommendation: 'Utilize botões com cores altamente contrastantes e textos imperativos claros como "Ver Planos" ou "Começar Grátis".',
        passed: ctaVisibilityScore >= 70
      },
      {
        key: 'info_hierarchy',
        label: 'Info Hierarchy',
        score: infoHierarchyScore,
        level: infoHierarchyScore >= 75 ? 'high' : infoHierarchyScore >= 50 ? 'medium' : infoHierarchyScore >= 25 ? 'low' : 'none',
        description: 'Organização textual lógica baseada em títulos estruturados (H1, H2, H3).',
        recommendation: 'Configure exatamente um único cabeçalho H1 no topo e distribua os subtítulos H2 e H3 de forma hierárquica.',
        passed: infoHierarchyScore >= 70
      },
      {
        key: 'distraction_score',
        label: 'Minimize Distractions',
        score: distractionScore,
        level: distractionScore >= 75 ? 'high' : distractionScore >= 50 ? 'medium' : distractionScore >= 25 ? 'low' : 'none',
        description: 'Limpeza visual medida pela ausência de scripts externos excessivos, iframes e imagens poluídas.',
        recommendation: 'Reduza o número de scripts bloqueantes no topo da página e limite o excesso de imagens decorativas desnecessárias.',
        passed: distractionScore >= 70
      }
    ];

    const weights: Record<string, number> = {
      focal_point: 0.25,
      cta_visibility: 0.35,
      info_hierarchy: 0.25,
      distraction_score: 0.15,
    };

    const overall = Math.round(
      criteria.reduce((acc, c) => acc + c.score * (weights[c.key] ?? 0.25), 0)
    );

    // Mapear focos no heatmap proporcionalmente à análise real
    const rng = (s: number) => ((Math.sin(s) + 1) / 2);
    const seed = targetUrl.length;
    const heatmap = {
      width: 1200,
      height: 628,
      aboveFoldY: 0.55,
      focusPoints: [
        // Ponto 1: Headline Principal (Influenciado por Info Hierarchy)
        { x: 0.25 + rng(seed) * 0.05, y: 0.22, intensity: parseFloat((infoHierarchyScore / 100).toFixed(2)), radius: 95 },
        // Ponto 2: Elemento de Hero (Influenciado por Focal Point)
        { x: 0.65 + rng(seed * 2) * 0.08, y: 0.35, intensity: parseFloat((focalPointScore / 100).toFixed(2)), radius: 80 },
        // Ponto 3: Botão de CTA principal (Influenciado por CTA Visibility)
        { x: 0.45, y: 0.58 + rng(seed * 3) * 0.04, intensity: parseFloat((ctaVisibilityScore / 100).toFixed(2)), radius: 65 },
        // Ponto 4: Ruído ou distração (Influenciado de forma inversa por Distraction Score)
        { x: 0.78, y: 0.72, intensity: parseFloat(((100 - distractionScore) / 150).toFixed(2)), radius: 50 },
      ],
    };

    const predictedCTR = parseFloat((1.8 * (overall / 75)).toFixed(2));

    return NextResponse.json({
      success: true,
      overall,
      criteria,
      heatmap,
      predictedCTR,
      ctrBenchmark: 1.80,
      ctrDelta: parseFloat((predictedCTR - 1.80).toFixed(2)),
      aboveFoldScore: Math.round(overall * 0.95),
      analyzedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: "Falha interna no processamento da análise visual.",
      details: err.message,
      troubleshoot: [
        "Tente atualizar novamente após alguns instantes.",
        "Se o erro persistir, verifique a conexão do servidor com o banco de dados."
      ]
    }, { status: 500 });
  }
}
