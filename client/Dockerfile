FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Set environment variables for build
ENV REACT_APP_API_URL=https://webapp-backend.ah1ajr.easypanel.host/api \
    NODE_ENV=production

# Build the app
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
