# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

bet-tok is a full-stack prediction market explorer providing a read-only interface to Polymarket data via the Gamma API. It consists of a React frontend and a Node.js backend proxy.

## Build & Development Commands

### Backend (port 3001)
```bash
cd backend
npm install
npm run dev      # Start with file watch (tsx watch)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled JS
```

### Frontend (port 5173)
```bash
cd frontend
npm install
npm run dev      # Start Vite dev server
npm run build    # Type check + Vite build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

Both services must run simultaneously for development. Vite proxies `/api/*` requests to the backend.

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, TanStack Router (file-based routing), TanStack React Query, Tailwind CSS v4, shadcn/ui
- **Backend**: HonoJS, Node.js, TypeScript
- **Node version**: 22.0.0+

## Architecture

### Domain-Driven Feature Structure
Features are isolated under `frontend/src/features/[feature-name]/` with clear separation:
- `types/` → TypeScript interfaces
- `api/` → Service layer + React Query hooks
- `components/` → Feature-specific UI components
- `pages/` → Page components

### Data Flow
```
React Component → React Query Hook → Service (parsing) → Axios Client → Backend (Hono) → Gamma API
```

### File-Based Routing
Routes are defined in `frontend/src/routes/`. TanStack Router auto-generates the route tree with code-splitting.

### Path Aliases
`@/` maps to `frontend/src/` (configured in tsconfig.json)

## Key Locations

- **Backend API routes**: `backend/src/routes/polymarket.ts`
- **Gamma API client**: `backend/src/lib/polymarket-client.ts`
- **Market types**: `frontend/src/features/markets/types/market.types.ts`
- **API service**: `frontend/src/features/markets/api/markets.service.ts`
- **React Query hooks**: `frontend/src/features/markets/api/markets.queries.ts`
- **Shared utilities**: `frontend/src/lib/utils.ts` (formatCurrency, formatPercentage, cn)
- **API client config**: `frontend/src/lib/api-client.ts`
- **shadcn components**: `frontend/src/components/ui/`

## Backend API Endpoints

- `GET /api/markets` - List markets (params: limit, offset, active, closed)
- `GET /api/markets/:id` - Get market by ID
- `GET /api/markets/search?q=query` - Search markets
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event by ID
- `GET /health` - Health check

## Data Model Notes

Market data from Gamma API includes `outcomes` and `outcomePrices` as JSON strings. The service layer parses these into `parsedOutcomes` array with `{ name: string, price: number }` objects. Prices are decimals (0-1) representing probabilities.

## Adding New Features

1. Create feature folder: `frontend/src/features/[feature-name]/`
2. Follow the market feature pattern: types → api (service + queries) → components → pages
3. Add route files in `frontend/src/routes/`
4. Backend: Add handler in `backend/src/routes/polymarket.ts`, implement Gamma call in `polymarket-client.ts`

## Testing

The project uses **Vitest** for both frontend and backend testing with comprehensive coverage.

### Test Commands

**Backend (`cd backend`):**
```bash
npm test              # Run all tests (unit + integration)
npm run test:unit     # Run only unit tests (mocked)
npm run test:integration  # Run only integration tests (real Gamma API)
npm run test:coverage # Run with coverage report
```

**Frontend (`cd frontend`):**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Run with coverage report
```

### Test Structure

**Backend tests:**
- `src/lib/__tests__/polymarket-client.test.ts` - Gamma API client unit tests
- `src/lib/__tests__/polymarket-client.integration.test.ts` - Real API integration tests
- `src/routes/__tests__/polymarket.test.ts` - Route handler tests
- `src/__tests__/app.test.ts` - App configuration tests (health, CORS, 404)

**Frontend tests:**
- `src/lib/__tests__/utils.test.ts` - Utility function tests
- `src/features/markets/api/__tests__/markets.service.test.ts` - Service layer tests
- `src/features/markets/api/__tests__/markets.queries.test.tsx` - React Query hook tests
- `src/shared/hooks/__tests__/useMediaQuery.test.ts` - Media query hook tests

**Frontend test infrastructure:**
- `src/test/setup.ts` - Global test setup with jest-dom and MSW
- `src/test/mocks/server.ts` - MSW server configuration
- `src/test/mocks/handlers.ts` - API mock handlers
- `src/test/mocks/data/markets.ts` - Mock data fixtures

### Diagnosing Issues

If tests pass locally but production fails, the issue is likely deployment-related (Vercel config, environment variables, cold starts).

## Vercel Deployment

The project is configured for Vercel with a serverless API function.

### Deployment Architecture

```
Vercel
├── /api/index.ts      → Serverless function (HonoJS)
├── frontend/dist/     → Static frontend build
└── vercel.json        → Deployment config
```

### Key Files

- **Serverless function**: `/api/index.ts` - Self-contained Hono app with Gamma API client
- **Vercel config**: `/vercel.json` - Build commands, output directory, API rewrites
- **Root package.json**: `/package.json` - Dependencies for the serverless function

### How It Works

1. Frontend is built from `frontend/` and served as static files
2. API requests to `/api/*` are rewritten to the serverless function
3. The serverless function proxies requests to Gamma API with CORS handling

### Environment Variables (Optional)

- `PRODUCTION_DOMAIN` - Custom domain for CORS (auto-allows `*.vercel.app`)
- `VERCEL_ENV` - Automatically set by Vercel (`production`, `preview`, `development`)

### Important: Edge Runtime

The API function uses **Edge Runtime** (`export const config = { runtime: "edge" }`) which is critical for performance. Without it, Node.js serverless functions have slow cold starts (5+ seconds) that can cause timeouts. Edge runtime has near-instant cold starts and runs closer to users.

The function also includes a 25-second fetch timeout to prevent indefinite hangs when calling the Gamma API.

### Local vs Production

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Local dev | Vite dev server (5173) | Node.js (3001) |
| Vercel | Static files | Serverless function |

The frontend API client uses relative URLs (`/api/*`) which work in both environments.

## Configuration

- **Vite config**: `frontend/vite.config.ts` (proxy, plugins, aliases)
- **Vitest config**: `backend/vitest.config.ts`, `frontend/vitest.config.ts`
- **shadcn config**: `frontend/components.json`
- **React Query stale time**: 5 minutes (defined in `frontend/src/shared/constants.ts`)
