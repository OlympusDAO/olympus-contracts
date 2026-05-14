FROM node:22-bookworm-slim AS builder

# Needed for npm dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    gcc \
    g++ \
    git && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHON="/usr/bin/python3"

# Install dependencies
RUN mkdir -p /opt
WORKDIR /opt
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
# Workaround for an issue with package manager and git
RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/ && \
    git config --global url."https://".insteadOf git://
RUN pnpm install --frozen-lockfile

# Copy files required for deployment
COPY hardhat.config.ts .
COPY contracts contracts
COPY scripts scripts
COPY deployments/localhost deployments/localhost

FROM node:22-bookworm-slim

WORKDIR /opt

RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt /opt

RUN rm -rf \
    /root/.cache/node/corepack \
    /root/.npm \
    /usr/local/lib/node_modules/corepack \
    /usr/local/lib/node_modules/npm \
    /usr/local/bin/corepack \
    /usr/local/bin/corepack-pnpm \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /tmp/* \
    /usr/local/share/.cache

USER node

EXPOSE 8545

HEALTHCHECK --interval=10s --timeout=15s --start-period=60s --retries=6 CMD node -e "fetch('http://localhost:8545/').then(() => process.exit(0)).catch(() => process.exit(1))"

# Run the node by default
ENTRYPOINT ["./node_modules/.bin/hardhat", "node", "--network", "hardhat"]
