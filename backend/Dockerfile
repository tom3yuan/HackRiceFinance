FROM node:20

# Create app directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install only production deps
RUN npm install --omit=dev

# Copy rest of application
COPY . .

# Expose the port Cloud Run will map to $PORT
EXPOSE 8080

# Start backend
CMD ["node", "server.js"]