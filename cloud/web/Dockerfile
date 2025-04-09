# Needs to be build from /cloud dir

FROM node:22-alpine3.20 AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY ./package.json ./
COPY ./package-lock.json ./

COPY ./api ./api
COPY ./web ./web

RUN npm ci

WORKDIR /app/web
RUN npm run build

FROM caddy:2.8-alpine
WORKDIR /app

COPY --from=builder /app/web/dist /usr/share/caddy/
COPY ./web/Caddyfile /etc/caddy/Caddyfile