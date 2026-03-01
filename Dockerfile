FROM node:22-bookworm-slim

# Install Chrome system dependencies
RUN apt-get update && apt install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2 \
  curl \
  unzip

# Install bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Copy dependency files first (better layer caching)
COPY package.json bun.lock* tsconfig.json* remotion.config.* ./
COPY src ./src
COPY public ./public

# Install dependencies and download Chrome
RUN bun install
RUN bunx remotion browser ensure

EXPOSE 3000

CMD ["bunx", "remotion", "studio"]
