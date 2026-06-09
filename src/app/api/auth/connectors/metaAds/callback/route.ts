import { GET as genericGet } from '../../[connector]/callback/route';

export async function GET(request: Request) {
  return genericGet(request, { params: Promise.resolve({ connector: 'metaAds' }) });
}
