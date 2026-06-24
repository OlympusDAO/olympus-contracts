# AGENTS.md

## Project Overview

This repository contains the core Olympus smart contracts, deployment tooling, and Solidity source used by the protocol.

## Node and Tooling

- Node.js must use version 22+.
- Use `.nvmrc` and `.node-version` files for version alignment.
- Run `pnpm install --frozen-lockfile` before dependency-dependent work.

## Common Commands

- `pnpm install --frozen-lockfile`: install dependencies
- `pnpm run lint` or repository lint equivalent: run project lint checks
- `pnpm run compile` (or `pnpm run build`, which aliases compile) : validate builds succeed
- `pnpm test` or repository test equivalent: validate behavior changes
