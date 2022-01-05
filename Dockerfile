FROM node:14-buster-slim

# Needed for npm dependencies
RUN apt-get update && apt-get install -y python3.7 make gcc g++ git
ENV PYTHON="/usr/bin/python3.7"

# Install dependencies
RUN mkdir -p /opt
WORKDIR /opt
COPY package.json .
COPY yarn.lock .
# Workaround for an issue with yarn and git
RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/ && \
    git config --global url."https://".insteadOf git://
RUN yarn install --frozen-lockfile

# COPY files required for deployment
COPY hardhat.config.ts .
COPY contracts contracts
COPY scripts scripts

EXPOSE 8545

HEALTHCHECK --interval=10s --timeout=15s --start-period=10s --retries=3 CMD curl -f http://localhost:8545/ || exit 1

# Run the node by default
ENTRYPOINT yarn run start
