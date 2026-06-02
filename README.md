# SMEO

Monorepo workspace with a Next.js frontend and a separate Express backend.

## Structure

- `frontend`: Next.js + TypeScript + Tailwind + shadcn/ui
- `backend`: Express.js API service

## Commands

- `pnpm dev` starts the frontend
- `pnpm dev:backend` starts the backend
- `pnpm build` builds both services
- `pnpm lint` lints both services

## Backend Setup

The backend uses Prisma 7 with the PostgreSQL adapter flow.

Set these values in `backend/.env` before running migrations:

- `DATABASE_URL`
- `JWT_SECRET`

Useful commands:

- `pnpm --dir backend prisma:generate`
- `pnpm --dir backend prisma:migrate`
- `pnpm --dir backend prisma:studio`