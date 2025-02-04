# Build stage
FROM node:22.13.1-alpine AS build

WORKDIR /app
RUN apk update && apk add --no-cache dumb-init

COPY . .
RUN npm ci

RUN NX_DAEMON=false npm run server:build
RUN X_DAEMON=false npm run dashboard:build

# CMD ["tail",  "-f", "/dev/null"]

# RUN npm run dashboard:build
# RUN npm run server:build


## RUNTIME IMAGE ###
FROM node:22.13.1-alpine
LABEL org.opencontainers.image.source https://github.com/ODZ-UJF-AV-CR/GAPP

WORKDIR /app

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
COPY --from=build /app/dist/apps ./

WORKDIR /app/gapp-server

RUN npm ci

EXPOSE 3000

ENV NODE_ENV=production

CMD ["dumb-init", "node", "main.js"]

# WORKDIR /app
# RUN corepack enable


# COPY package.json .yarnrc.yml prepare.sh yarn.lock tsconfig.base.json ./
# COPY .yarn ./.yarn
# COPY apps/api/package.json ./apps/api/

# RUN yarn
# COPY apps/api ./apps/api
# RUN yarn workspace @stte/api db:generate
# RUN yarn workspace @stte/api build

# ## RUNTIME IMAGE ###
# FROM node:20.11.1-alpine

# WORKDIR /app
# RUN corepack enable

# COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
# COPY --from=build /app/package.json /app/yarn.lock /app/prepare.sh ./
# COPY --from=build /app/apps/api/package.json ./apps/api/
# COPY --from=build /app/apps/api/prisma-client ./apps/api/prisma-client
# COPY apps/api/swagger.yaml ./
# COPY --from=build /app/apps/api/dist ./apps/api/dist

# RUN yarn cache clean && yarn workspaces focus @stte/api --production

# CMD ["dumb-init", "yarn", "start:api"]
