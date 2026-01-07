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

## Configuration

- **Vite config**: `frontend/vite.config.ts` (proxy, plugins, aliases)
- **shadcn config**: `frontend/components.json`
- **React Query stale time**: 5 minutes (defined in `frontend/src/shared/constants.ts`)
