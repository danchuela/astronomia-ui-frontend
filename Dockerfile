# Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# En Windows/Docker a veces localhost falla; 127.0.0.1 suele ser más fiable
ENV VITE_API_URL=http://127.0.0.1:3000
RUN npm run build

# Serve con nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
