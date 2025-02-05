FROM node:22.13.1-alpine AS build

WORKDIR /app
RUN apk update && apk add --no-cache dumb-init

COPY . .
RUN npm ci

RUN NX_DAEMON=false npm run server:build
RUN X_DAEMON=false npm run dashboard:build

## RUNTIME IMAGE ###
FROM node:22.13.1-alpine
LABEL org.opencontainers.image.source=https://github.com/ODZ-UJF-AV-CR/GAPP

WORKDIR /app

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build /app/dist/apps ./

WORKDIR /app/gapp-server

RUN npm ci

EXPOSE 3000

ENV NODE_ENV=production

CMD ["dumb-init", "node", "main.js"]
