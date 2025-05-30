#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Get all Docker images starting with revision-ai/ and tagged with latest
images=$(docker images "revision-ai/*:latest" --format "{{.Repository}}:{{.Tag}}")

if [ -z "$images" ]; then
    echo -e "${RED}No revision-ai images found${NC}"
    exit 1
fi

echo "Loading images into kind cluster..."

# Load each image into kind
for image in $images; do
    echo -e "\n${GREEN}Loading $image...${NC}"
    if kind load docker-image "$image"; then
        echo -e "${GREEN}Successfully loaded $image${NC}"
    else
        echo -e "${RED}Failed to load $image${NC}"
        exit 1
    fi
done

echo -e "\n${GREEN}All images loaded successfully!${NC}"