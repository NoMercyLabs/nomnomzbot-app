# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (C) NoMercy Entertainment. All rights reserved.

# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# EXPO_PUBLIC_API_URL is baked into the JS bundle at build time.
# Pass your actual API domain here via docker-compose build args.
ARG EXPO_PUBLIC_API_URL=http://localhost:5080
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN yarn build:web

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:alpine AS final
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
