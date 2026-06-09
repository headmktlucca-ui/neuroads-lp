import { GET as genericGet } from '../../[connector]/start/route';

export async function GET(request: Request) {
  return genericGet(request, { params: Promise.resolve({ connector: 'googleAds' }) });
}
