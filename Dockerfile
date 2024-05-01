FROM nginx:1.26.0-alpine-slim as base

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/dist/ /var/www

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]