#!/bin/bash

# Get the absolute path to the services directory
SERVICES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../services" && pwd)"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Building Docker images from ${SERVICES_DIR}..."
# Loop through each service directory
for service in "${SERVICES_DIR}"/*; do
    if [ -d "${service}" ]; then
        service_name=$(basename "${service}")
        echo -e "\n${GREEN}Building ${service_name}...${NC}"
        
        # Check if Dockerfile exists
        if [ -f "${service}/Dockerfile" ]; then
            docker build -t "revision-ai/${service_name}:latest" \
                        --target production \
                        -f "${service}/Dockerfile" \
                        "${service}"
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Successfully built ${service_name}${NC}"
            else
                echo -e "${RED}Failed to build ${service_name}${NC}"
                exit 1
            fi
        else
            echo -e "${RED}No Dockerfile found in ${service}${NC}"
        fi
    fi
done

echo -e "\n${GREEN}All images built successfully!${NC}"