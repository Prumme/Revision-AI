FROM node:22-bullseye-slim

# Create app directory

WORKDIR /usr/src/app

# install poppler

RUN apt-get update && apt-get install -y \
    poppler-utils \
    poppler-data \
    && rm -rf /var/lib/apt/lists/*

# Install teseract

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Install app dependencies
RUN npm install
# Bundle app source

CMD ["npm", "run", "dev"]

