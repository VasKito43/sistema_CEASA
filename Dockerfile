# --- Etapa 1: build do Vue ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Etapa 2: servir com Nginx ---
FROM nginx:alpine
# copia build final para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# expõe porta 80
EXPOSE 80
# mantém o Nginx rodando em foreground
CMD ["nginx", "-g", "daemon off;"]
