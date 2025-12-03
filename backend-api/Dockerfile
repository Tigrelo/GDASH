
FROM oven/bun:1 as base
WORKDIR /app

COPY package.json package-lock.json ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start:prod"]
