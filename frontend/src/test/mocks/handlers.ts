import { http, HttpResponse } from 'msw';
import { mockMarkets, mockMarket } from './data/markets';

export const handlers = [
  // GET /api/markets
  http.get('/api/markets', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    return HttpResponse.json({
      data: mockMarkets.slice(0, limit),
    });
  }),

  // GET /api/markets/search
  http.get('/api/markets/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query) {
      return HttpResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const filtered = mockMarkets.filter(m =>
      m.question.toLowerCase().includes(query.toLowerCase())
    );
    return HttpResponse.json({ data: filtered });
  }),

  // GET /api/markets/:id
  http.get('/api/markets/:id', ({ params }) => {
    const { id } = params;

    if (id === 'not-found') {
      return HttpResponse.json(
        { error: 'Market not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({ data: { ...mockMarket, id } });
  }),

  // GET /api/events
  http.get('/api/events', () => {
    return HttpResponse.json({ data: [] });
  }),

  // GET /api/events/:id
  http.get('/api/events/:id', ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, title: 'Test Event', markets: [] },
    });
  }),
];
