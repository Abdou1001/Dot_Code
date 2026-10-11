# Dot Code Portfolio Backend

## Phase 1

The backend foundation provides Express setup, validated environment configuration, a server-only Supabase client, security middleware, and global error handling.

## Setup

1. Copy `.env.example` to `.env`.
2. Set the real `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for Dot Code Portfolio. Do not commit `.env`.
3. Install dependencies with `npm install`.
4. Run `npm run dev`.

Feature APIs begin in later approved phases.

## Foundation check

After configuring `.env`, request `GET /api/health` to confirm the server is running.
