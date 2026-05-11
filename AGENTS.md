# KodzenIdiaa Development Guidelines

## Project Overview
AI-powered sports betting prediction platform built with Next.js 16, TypeScript, and Tailwind CSS 4.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## Architecture
- App Router (Next.js) with server/client components
- API routes under `src/app/api/`
- Prediction engine in `src/lib/prediction-engine.ts`
- External API client in `src/lib/football-api.ts`
- State management via Zustand (`src/lib/store.ts`)

## Conventions
- Turkish UI labels (no special characters in code identifiers)
- All components use "use client" directive when using hooks
- Tailwind CSS for all styling (dark theme)
- Types defined in `src/lib/types.ts`
- Demo data fallback when API key is not configured
