# Image to obtain dumb-initi binary
FROM alpine AS init
RUN apk update && apk add --no-cache libc6-compat dumb-init

# Initialize node environment with pnpm
FROM node:24.5.0-alpine AS pnpm-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY package.json ./
RUN corepack enable
RUN pnpm config set inject-workspace-packages=true

# Build the app and export server
FROM pnpm-base AS builder
WORKDIR /gapp

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/dashboard/package.json ./apps/dashboard/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY packages/sondehub/package.json ./packages/sondehub/package.json
RUN pnpm install --frozen-lockfile

COPY apps ./apps
COPY packages ./packages

RUN pnpm run build
RUN pnpm --filter @gapp/server deploy --prod server

# Runtime image
FROM node:24.5.0-alpine AS runner
WORKDIR /gapp

COPY --from=init /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=builder /gapp/apps/dashboard/dist/dashboard/browser ./dashboard
COPY --from=builder /gapp/server/dist ./server/dist
COPY --from=builder /gapp/server/node_modules ./server/node_modules

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/main.js"]
