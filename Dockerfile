FROM node:14-buster-slim

# Needed for npm dependencies
RUN apt-get update && apt-get install -y python3.7 make gcc g++
ENV PYTHON="/usr/bin/python3.7"

# Needed for lockfile v2
RUN npm install -g npm@8.1.0

# Install dependencies
RUN mkdir -p /opt
WORKDIR /opt
COPY package.json .
COPY package-lock.json .
RUN npm install

COPY hardhat.config.js .

EXPOSE 8545

# ENTRYPOINT
