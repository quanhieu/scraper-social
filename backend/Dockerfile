FROM node:20-bullseye

WORKDIR /app/backend

# Install Chrome and dependencies
RUN apt-get update && apt-get install -y \
  wget \
  gnupg2 \
  ca-certificates \
  unzip \
  libgconf-2-4 \
  chromium \
  chromium-driver \
  && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 8000

# Start the application
CMD ["yarn", "dev"] 