include .env
export

DOCKER_IMAGE=olympusdao/olympus-contracts
# Use the branch name as the tag
DOCKER_TAG=$(shell git branch --show-current)
DOCKER_VOLUMES=--volume $(shell pwd)/contracts:/opt/contracts/ --volume $(shell pwd)/scripts:/opt/scripts/
DOCKER_PORTS=-p 8545:8545
# Make sure any command using this variable is prepended by @ to hide it from the console & logs
DOCKER_ENV=-e ALCHEMY_API_KEY=$(ALCHEMY_API_KEY) -e PRIVATE_KEY=$(PRIVATE_KEY)

build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

run: build
	@docker run -it --rm $(DOCKER_ENV) $(DOCKER_VOLUMES) $(DOCKER_PORTS) $(DOCKER_IMAGE):$(DOCKER_TAG)

shell: build
	@docker run -it --rm --entrypoint /bin/sh $(DOCKER_ENV) $(DOCKER_VOLUMES) $(DOCKER_PORTS) $(DOCKER_IMAGE):$(DOCKER_TAG)

_check_login_vars:
	@test $${DOCKER_USER?Please set environment variable DOCKER_USER}
	@test $${DOCKER_PASS?Please set environment variable DOCKER_PASS}

push: _check_login_vars build
	@docker login -u "$(DOCKER_USER)" -p "$(DOCKER_PASS)"
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
