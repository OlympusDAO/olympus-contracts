# TODO shift to using official registry repo
DOCKER_IMAGE=0xjem/olympus-contracts
DOCKER_TAG=$(shell git branch --show-current)
DOCKER_VOLUMES=--volume $(shell pwd)/contracts:/opt/contracts/ --volume $(shell pwd)/scripts:/opt/scripts/
DOCKER_PORTS=-p 8545:8545
include .env
export

build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

run: build
	docker run -it --rm $(DOCKER_VOLUMES) $(DOCKER_PORTS) $(DOCKER_IMAGE):$(DOCKER_TAG)

shell: build
	docker run -it --rm $(DOCKER_VOLUMES) $(DOCKER_PORTS) $(DOCKER_IMAGE):$(DOCKER_TAG) /bin/sh

_check_login_vars:
	@test $${DOCKER_USER?Please set environment variable DOCKER_USER}
	@test $${DOCKER_PASS?Please set environment variable DOCKER_PASS}

push: _check_login_vars build
	@docker login -u "$(DOCKER_USER)" -p "$(DOCKER_PASS)"
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
