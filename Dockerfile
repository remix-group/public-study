# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24.20.0-bookworm-slim
ARG NGINX_IMAGE=nginx:1.30.4-alpine3.24-slim
ARG PNPM_VERSION=11.23.0

FROM ${NODE_IMAGE} AS node-base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm
ENV COREPACK_HOME=/corepack
ENV PATH=${PNPM_HOME}:${PATH}
ENV PNPM_CONFIG_FETCH_RETRIES=5
ENV PNPM_CONFIG_FETCH_TIMEOUT=600000
ENV PNPM_CONFIG_NETWORK_CONCURRENCY=4
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates openssl && \
    rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

FROM node-base AS workspace
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/infrastructure/package.json packages/infrastructure/package.json
COPY packages/learning/package.json packages/learning/package.json
RUN --mount=type=cache,id=dian-pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @dian-study/infrastructure db:generate
RUN pnpm build

FROM node-base AS api
ENV NODE_ENV=production
WORKDIR /app

COPY --from=workspace --chown=node:node /app /app
RUN mkdir -p /app/apps/api/data/legal-sources && chown -R node:node /app/apps/api/data

USER node
EXPOSE 3000
CMD ["pnpm", "--filter", "@dian-study/api", "start"]

FROM ${NGINX_IMAGE} AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=workspace /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
