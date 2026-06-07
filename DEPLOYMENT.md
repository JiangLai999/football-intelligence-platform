# Deployment Guide

## Overview

This project can be deployed as a standard Next.js application backed by PostgreSQL.

Current production assumptions:

- a PostgreSQL database is already provisioned
- `DATABASE_URL` is available to the runtime
- Prisma client is generated during install or CI
- the app is started with `npm run start`

## Required Environment Variables

Copy the production template and provide a real database connection:

```bash
copy .env.production.example .env.production
```

Required values:

- `DATABASE_URL`
- `NODE_ENV=production`
- `AUTH_SECRET`
- `OPERATOR_USERNAME`
- `OPERATOR_PASSWORD`

## CI Validation

The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml`.

It runs:

- `npm ci`
- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Container Deployment

Build the application image:

```bash
docker build -t football-intelligence-platform .
```

Run the image with production environment variables:

```bash
docker run --rm -p 3000:3000 --env-file .env.production football-intelligence-platform
```

## Non-Container Deployment

Install dependencies and build:

```bash
npm ci
npm run db:generate
npm run build
```

Start the production server:

```bash
npm run start
```

## Database Preparation

Before the first deployment, ensure the schema is applied and seed only if you want demo data:

```bash
npm run db:push
```

Optional demo seed:

```bash
npm run db:seed
```

## Recommended Hosting Targets

- Vercel with managed PostgreSQL
- Railway / Render / Fly.io with external Postgres
- Docker-based VPS or container platform

## Operator Security Notes

The operator console records audit events for:

- successful logins
- failed logins
- logouts
- unauthorized operator API access
- source toggles
- alert state changes
- job execution actions
- rate-limited login attempts

Login rate limiting is enforced in-process: 5 consecutive failures from the same username/IP within 15 minutes will block further attempts until the window expires. Rate-limited events are recorded as `LOGIN_RATE_LIMITED` in `AuditLog`.

## Next Production Improvements

Recommended follow-up work before a public production rollout:

1. add authentication for operator APIs
2. move job execution out of request-response handlers
3. add observability and structured logging
4. add Prisma migration workflow instead of schema push only
5. add secret management for deployment environments
