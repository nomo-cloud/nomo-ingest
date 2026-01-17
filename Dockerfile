FROM debian:bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wkhtmltopdf \
    xvfb \
    fonts-liberation \
    fonts-dejavu-core \
    fontconfig \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create temp directory for PDF generation
RUN mkdir -p /tmp && chmod 777 /tmp

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start server
CMD ["node", "server.js"]
