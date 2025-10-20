FROM node:23-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn config set network-timeout 600000 -g && \
    yarn install --frozen-lockfile --verbose
COPY . .
RUN yarn build

FROM node:23-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000 3000
CMD ["node", "dist/main.js"]
