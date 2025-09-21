# Stage 1 - Build the React app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2 - Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Point nginx to listen on Cloud Run's $PORT variable
EXPOSE 8080
CMD ["sh", "-c", "sed -i \"s/listen  .*/listen ${PORT};/\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]