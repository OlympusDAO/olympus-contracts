DOCKER_IMAGE=olympus-contracts
DOCKER_TAG=$(shell git branch --show-current)
DOCKER_VOLUMES=--volume contracts:/opt/contracts --volume scripts:/opt/scripts

build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

run: build
	docker run -it --rm $(DOCKER_VOLUMES) $(DOCKER_IMAGE):$(DOCKER_TAG)

shell: build
	docker run -it --rm $(DOCKER_VOLUMES) $(DOCKER_IMAGE):$(DOCKER_TAG) /bin/sh
