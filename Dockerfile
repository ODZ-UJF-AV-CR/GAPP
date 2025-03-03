FROM node:22.13.1-alpine AS build

WORKDIR /app
RUN apk update && apk add --no-cache dumb-init

COPY . .
RUN npm install -g corepack@0.32.0
RUN corepack enable
RUN pnpm i --frozen-lockfile

RUN NX_DAEMON=false pnpm run server:build
RUN NX_DAEMON=false pnpm run dashboard:build

## RUNTIME IMAGE ###
FROM node:22.13.1-alpine
LABEL org.opencontainers.image.source=https://github.com/ODZ-UJF-AV-CR/GAPP

WORKDIR /app

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build /app/dist/apps ./

RUN npm install -g corepack@0.32.0
RUN corepack enable

WORKDIR /app/gapp-server

RUN pnpm i --frozen-lockfile

EXPOSE 3000

ENV NODE_ENV=production

CMD ["dumb-init", "node", "main.js"]
