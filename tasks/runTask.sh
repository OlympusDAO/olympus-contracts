#!/bin/bash

if [[ "$1" == "mainnet" ]] || [[ "$1" == "rinkeby" ]] || [[ "$1" = "ropsten" ]];
then
	NETWORK=$1
	shift 1
else
	NETWORK='localhost'
fi

TASK_PREFIX="$1"
TASK_SUFFIX="$2"

shift 2

yarn hardhat --network $NETWORK $TASK_PREFIX$TASK_SUFFIX $@
