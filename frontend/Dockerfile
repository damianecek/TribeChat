# 1. Base image
FROM node:20-alpine AS build

WORKDIR /app

# 2. Install Quasar CLI globally
RUN npm install -g @quasar/cli

# 3. Copy all files first (dôležité!)
COPY . .

# 4. Install dependencies
RUN npm install

# 5. Build the SPA
RUN quasar build

# 6. Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
