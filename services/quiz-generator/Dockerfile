FROM node:22-bullseye-slim as base
# Create app directory

WORKDIR /app

COPY package.json package-lock.json ./
# Install app dependencies
RUN npm install

## PRODUCTION
FROM base as production
# Copy app source code
COPY . .
# Build the app
RUN npm run build
# Expose the port the app runs on
EXPOSE 3000
# Start the app
CMD ["npm","run","start"]

## DEV
FROM base as dev
# need volume to be mounted
CMD ["npm", "run","dev"]

