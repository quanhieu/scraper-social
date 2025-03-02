FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install -g yarn

RUN yarn

# Copy application code
COPY . .

# Build the application
RUN yarn build

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["yarn", "start:prod"]