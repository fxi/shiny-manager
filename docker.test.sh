#!/bin/bash
docker build -t shiny-manager-test -f Dockerfile.test . && docker run --rm shiny-manager-test