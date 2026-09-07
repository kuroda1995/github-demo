# --- ビルド用ステージ: Viteで静的ファイルにビルドする ---
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci
# 空文字にすることで、フロントは相対パス(/api/...)でAPIを呼ぶ。
# 同じNginxが配信するページからのアクセスになるため、CORS設定も不要になる。
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# --- 配信用ステージ: ビルド済みファイルをNginxで配信する ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
