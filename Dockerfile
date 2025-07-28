# Use Node.js 18 as base image
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build the React app
RUN cd client && npm run build

# Expose port 5000 (backend)
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "server/index.js"] 