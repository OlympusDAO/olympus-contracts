#!/usr/bin/env just --justfile
# @title Foundry Justfile
# @version: 0.2.2
# @license ISC
# 
# TODO:
#   document justfile using https://github.com/tests-always-included/tomdoc.sh

bt := '0'
export RUST_BACKTRACE := bt

log := "warn"
export JUST_LOG := log

_default:
  just --list

# load .env file
set dotenv-load

# pass justfile recipe args as positional arguments to commands
set positional-arguments

# sourced from https://github.com/sense-finance/sense-v1
DAPP_BUILD_OPTIMIZE := "1"
DAPP_COVERAGE       := "1"
DAPP_TEST_FUZZ_RUNS := "100"

# 1e18 decimals
HEX_18 := "0x0000000000000000000000000000000000000000000000000000000000000012"
HEX_12 := "0x000000000000000000000000000000000000000000000000000000000000000c"
HEX_8  := "0x0000000000000000000000000000000000000000000000000000000000000008"
HEX_6  := "0x0000000000000000000000000000000000000000000000000000000000000006"

# set mock target to 18 decimals by default
FORGE_MOCK_TARGET_DECIMALS := env_var_or_default("FORGE_MOCK_TARGET_DECIMALS", HEX_18)
FORGE_MOCK_UNDERLYING_DECIMALS := env_var_or_default("FORGE_MOCK_UNDERLYING_DECIMALS", HEX_18)

# Alchemy API Key is public
# Mnemonic is hardhat's default
ALCHEMY_KEY := env_var_or_default("ALCHEMY_KEY", "vI8OBZj4Wue9yNPSDVa7Klqt-UeRywrx")
MAINNET_RPC := "https://eth-mainnet.alchemyapi.io/v2/" + ALCHEMY_KEY
MNEMONIC    := env_var_or_default("MNEMONIC", "test test test test test test test test test test test junk")

# export just vars as env vars
set export

# Contract Size
size:
	forge build --sizes --force

# Build Output
build: && _timer
	cd {{ invocation_directory() }}; forge build --sizes --names --force

# [TEST] mainnet test
build-mainnet: && _timer
	cd {{ invocation_directory() }}; forge test --match-path "*.t.sol" --fork-url {{ MAINNET_RPC }}

# [TEST] default test scripts
test: test-local

# [TEST] run local forge test using --match-path <PATTERN>
test-local *commands="": && _timer
	cd {{ invocation_directory() }}; forge test --match-path "*.t.sol" {{ commands }}

# [TEST] run mainnet fork forge tests (all files with the extension .t.sol)
test-mainnet *commands="": && _timer
	cd {{ invocation_directory() }}; forge test --rpc-url {{ MAINNET_RPC }} --match-path "*.t.sol" {{ commands }}

# [TEST] run mainnet fork forge debug tests (all files with the extension .t.sol)
test-debug *commands="": && _timer
	cd {{ invocation_directory() }}; forge test --rpc-url {{ MAINNET_RPC }} --match-path "*.t.sol" {{ commands }}

gas-cov: forge test --gas-report

# [GAS] default gas snapshot script
gas-snapshot: gas-snapshot-local

# [GAS] get gas snapshot from local tests and save it to file
gas-snapshot-local:
    cd {{ invocation_directory() }}; \
    just test-local | grep 'gas:' | cut -d " " -f 2-4 | sort > \
    {{ justfile_directory() }}/gas-snapshots/.$( \
        cat {{ invocation_directory() }}/package.json | jq .name | tr -d '"' | cut -d"/" -f2- \
    )
# [GAS] get gas snapshot timer
forge-gas-snapshot: && _timer
	@cd {{ invocation_directory() }}; forge snapshot --no-match-path ".*.*"

forge-gas-snapshot-diff: && _timer
	@cd {{ invocation_directory() }}; forge snapshot --no-match-path ".*.*" --diff

# Solidity test ffi callback to get Target decimals for the base Mock Target token
_forge_mock_target_decimals:
    @printf {{ FORGE_MOCK_TARGET_DECIMALS }}

_forge_mock_underlying_decimals:
    @printf {{ FORGE_MOCK_UNDERLYING_DECIMALS }}

# [UTILS] utility functions
start_time := `date +%s`
_timer:
	@echo "[TASK]: Executed in $(($(date +%s) - {{ start_time }})) seconds"

# mode: makefile
# End:
# vim: set ft=make :
