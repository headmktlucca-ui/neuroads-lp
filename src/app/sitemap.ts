import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.neuroads.com.br';

  const routes = [
    '',
    '/a-neuroads',
    '/a-neuroads/sobre',
    '/a-neuroads/nosso-metodo',
    '/a-neuroads/contato',
    '/agentes-ia',
    '/servicos',
    '/servicos/gestao-de-trafego-google-meta',
    '/servicos/estrategia-de-funil-e-conversao',
    '/servicos/implantacao-de-agentes-ia',
    '/servicos/seo-geo',
    '/servicos/e-commerce-varejo',
    '/servicos/educacao-digital',
    '/servicos/saude-clinicas',
    '/servicos/mercado-imobiliario',
    '/servicos/servicos-profissionais',
    '/conteudos',
    '/whitepaper_ia_vendas',
    '/login',
    '/privacidade',
    '/termos',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route.startsWith('/servicos/') || route.startsWith('/a-neuroads/') ? 0.8 : 0.9,
  }));
}
