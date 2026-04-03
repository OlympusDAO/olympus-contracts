FROM node:22-bookworm-slim

# Needed for npm dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    gcc \
    g++ \
    git \
    curl

ENV PYTHON="/usr/bin/python3"

# Install dependencies
RUN mkdir -p /opt
WORKDIR /opt
COPY package.json .
COPY pnpm-lock.yaml .
RUN corepack enable
# Workaround for an issue with package manager and git
RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/ && \
    git config --global url."https://".insteadOf git://
RUN pnpm install --frozen-lockfile

# COPY files required for deployment
COPY hardhat.config.ts .
COPY contracts contracts
COPY scripts scripts
COPY deployments/localhost deployments/localhost

EXPOSE 8545

HEALTHCHECK --interval=10s --timeout=15s --start-period=60s --retries=6 CMD curl -f http://localhost:8545/ || exit 1

# Run the node by default
ENTRYPOINT ["pnpm", "run", "start"]
