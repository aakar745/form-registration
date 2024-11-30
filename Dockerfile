FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Set default environment variables
ENV NODE_ENV=production \
    PORT=5000 \
    MONGODB_URI=mongodb://mongodb:27017/formregistration

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
