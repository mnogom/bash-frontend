FROM node:alpine AS build
WORKDIR /usr/src/app
COPY ./package.json package-lock.json ./
RUN npm install
COPY ./index.html ./main.js ./styles.css ./
COPY ./public/ ./public/
RUN npm run build


FROM nginx:1.26.0-alpine-slim AS base
COPY --from=build /usr/src/app/dist/ /var/www/

FROM base AS no-ssl
COPY nginx/no-ssl.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]

FROM base
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
