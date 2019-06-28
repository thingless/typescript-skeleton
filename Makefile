.PHONY: package push tag help default

GIT_COMMIT := $(shell git rev-parse --short HEAD)
IMAGE_NAME := "company/PROJECT_NAME"

default: package

help:
	@echo 'Management commands for PROJECT_NAME:'
	@echo
	@echo 'Usage:'
	@echo '    make package         Build final docker image with just the go binary inside'
	@echo '    make tag             Tag image created by package with latest, git commit'
	@echo '    make test            Run tests on a compiled project.'
	@echo '    make push            Push tagged images to registry'
	@echo

package:
	@echo "building image ${BIN_NAME} $(GIT_COMMIT)"
	docker build --build-arg GIT_COMMIT=$(GIT_COMMIT) -t $(IMAGE_NAME):local .

tag:
	@echo "Tagging: latest $(GIT_COMMIT)"
	docker tag $(IMAGE_NAME):local $(IMAGE_NAME):$(GIT_COMMIT)
	docker tag $(IMAGE_NAME):local $(IMAGE_NAME):latest

push: tag
	@echo "Pushing docker image to registry: latest $(GIT_COMMIT)"
	docker push $(IMAGE_NAME):$(GIT_COMMIT)
	docker push $(IMAGE_NAME):latest
