# Utiliser une image Node.js officielle comme base
FROM node:22-alpine AS BUILDER
LABEL org.opencontainers.image.source=https://github.com/voikyrioh/vk-web-gp-cube
LABEL org.opencontainers.image.description="Runs nginx with static files exposed"
LABEL org.opencontainers.image.licenses=MIT

# Créer et définir le répertoire de travail
WORKDIR /app

# Copier le reste des fichiers du projet
COPY . .

# install && build
RUN npm ci
RUN npm run build

# Image Nginx pour servir l'application
FROM nginx:alpine

# Copier les fichiers construits depuis l'étape précédente
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80
