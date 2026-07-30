import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, creativeName, platform } = body;

    // Simulação de chamada para uma API real de Rastreamento Ocular IA / Atenção Visual Preditiva
    // Ex: Attention Insight, EyeQuant ou AWS Rekognition para segmentação.
    // Em produção real, faríamos um POST para a API externa passando a URL/imagem.
    
    // Geramos dados consistentes baseados no comprimento do input (seed)
    const subject = url || creativeName || 'neuroads.com.br';
    const seed = subject.length;
    const rng = (s: number) => ((Math.sin(s) + 1) / 2);

    const focal_point = Math.round(55 + (seed % 35));
    const cta_visibility = Math.round(50 + (seed % 40));
    const info_hierarchy = Math.round(60 + (seed % 30));
    const distraction_score = Math.round(45 + (seed % 40));

    const criteria = [
      {
        key: 'focal_point',
        label: 'Focal Point Clarity',
        score: focal_point,
        level: focal_point >= 75 ? 'high' : focal_point >= 50 ? 'medium' : focal_point >= 25 ? 'low' : 'none',
        description: 'Clareza do ponto focal principal da imagem',
        recommendation: 'Centralize o elemento mais importante e aumente o contraste em relação ao fundo.'
      },
      {
        key: 'cta_visibility',
        label: 'CTA Visibility',
        score: cta_visibility,
        level: cta_visibility >= 75 ? 'high' : cta_visibility >= 50 ? 'medium' : cta_visibility >= 25 ? 'low' : 'none',
        description: 'Visibilidade e destaque do botão de chamada para ação',
        recommendation: 'Use cor contrastante e posicione o CTA no terço inferior da dobra visível.'
      },
      {
        key: 'info_hierarchy',
        label: 'Info Hierarchy',
        score: info_hierarchy,
        level: info_hierarchy >= 75 ? 'high' : info_hierarchy >= 50 ? 'medium' : info_hierarchy >= 25 ? 'low' : 'none',
        description: 'Hierarquia visual das informações (título > subtítulo > corpo)',
        recommendation: 'Reduza o número de elementos com peso visual similar para criar fluxo claro.'
      },
      {
        key: 'distraction_score',
        label: 'Minimize Distractions',
        score: distraction_score,
        level: distraction_score >= 75 ? 'high' : distraction_score >= 50 ? 'medium' : distraction_score >= 25 ? 'low' : 'none',
        description: 'Ausência de elementos que desviam a atenção do objetivo principal',
        recommendation: 'Remova ou reduza elementos gráficos secundários que competem com o CTA.'
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

    const heatmap = {
      width: 1200,
      height: 628,
      aboveFoldY: 0.55,
      focusPoints: [
        { x: 0.3 + rng(seed) * 0.1, y: 0.15 + rng(seed * 2) * 0.1, intensity: 0.9, radius: 90 },
        { x: 0.5 + rng(seed * 3) * 0.15, y: 0.35 + rng(seed * 4) * 0.1, intensity: 0.75, radius: 70 },
        { x: 0.65 + rng(seed * 5) * 0.1, y: 0.6 + rng(seed * 6) * 0.1, intensity: 0.55, radius: 55 },
        { x: 0.2 + rng(seed * 7) * 0.1, y: 0.7 + rng(seed * 8) * 0.15, intensity: 0.3, radius: 40 },
      ],
    };

    // CTR preditivo baseado na plataforma
    const benchmarks: Record<string, number> = {
      'Meta Ads': 1.2,
      'Google Ads': 2.1,
      'LinkedIn Ads': 0.4,
      'TikTok Ads': 1.8,
      'Orgânico': 1.0,
    };

    const benchmark = benchmarks[platform || 'Meta Ads'] || 1.2;
    const predictedCTR = parseFloat((benchmark * (overall / 75)).toFixed(2));

    return NextResponse.json({
      success: true,
      overall,
      criteria,
      heatmap,
      predictedCTR,
      ctrBenchmark: benchmark,
      ctrDelta: parseFloat((predictedCTR - benchmark).toFixed(2)),
      aboveFoldScore: Math.round(45 + (seed % 45)),
      analyzedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
