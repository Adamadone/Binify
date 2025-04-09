# Needs to be build from /cloud dir

FROM node:22-alpine3.20

WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./

COPY ./api ./api

RUN npm ci

WORKDIR /app/api
RUN npm run build

# Doesn't correctly propagate kill signal, but that's alright
CMD [ "sh", "-c", "npx prisma migrate deploy && exec node dist/main.js" ]
