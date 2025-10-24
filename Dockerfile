ARG BASE=node:25-alpine3.21

FROM $BASE AS development
RUN npm i -g pnpm
WORKDIR /app
COPY package.json .
COPY pnpm-*.yaml .
RUN pnpm install --frozen-lockfile

FROM development AS build
COPY . .
RUN pnpm run build
RUN pnpm prune --prod

FROM $BASE AS production
RUN npm i -g pnpm
USER node
ENV NODE_ENV=production
WORKDIR /app
COPY drizzle.config.ts .
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/node_modules ./node_modules
CMD ["node", "dist/src/main.js"]
