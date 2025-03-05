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
  fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

# Set Chrome flags for running in Docker
ENV CHROME_FLAGS="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --disable-extensions --remote-debugging-port=9222 --disable-features=VizDisplayCompositor"



# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Create a script to run the application
RUN echo '#!/bin/bash\n\
  echo "Starting application..."\n\
  export SELENIUM_CHROME_ARGS="$CHROME_FLAGS"\n\
  yarn dev\n\
  ' > /app/backend/start.sh && chmod +x /app/backend/start.sh

# Expose the port
EXPOSE 8000

# Start the application
CMD ["/app/backend/start.sh"] 