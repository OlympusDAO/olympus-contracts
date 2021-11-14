DOCKER_IMAGE=olympus-contracts
DOCKER_TAG=$(shell git branch --show-current)
DOCKER_VOLUMES=--volume $(shell pwd)/contracts:/opt/contracts/ --volume $(shell pwd)/scripts:/opt/scripts/
DOCKER_PORTS=-p 8545:8545

build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

run: build
	docker run -it --rm $(DOCKER_VOLUMES) $(DOCKER_PORTS) $(DOCKER_IMAGE):$(DOCKER_TAG)

shell: build
	docker run -it --rm $(DOCKER_VOLUMES) $(DOCKER_PORTS) $(DOCKER_IMAGE):$(DOCKER_TAG) /bin/sh
