FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY client/ .

# Set environment variables for build
ENV REACT_APP_API_URL=https://webapp-backend.ah1ajr.easypanel.host/api \
    NODE_ENV=production

# Build the app
RUN npm run build

# Production environment
FROM nginx:alpine

# Copy custom nginx config
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
