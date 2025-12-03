FROM oven/bun:1 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN bun install --frozen-lockfile
COPY . .

RUN bun run build


FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html


RUN echo 'server { listen 80; root /usr/share/nginx/html; include /etc/nginx/mime.types; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]