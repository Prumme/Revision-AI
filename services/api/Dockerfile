FROM node:22-bullseye-slim as base
# Create app directory

# Set the working directory
WORKDIR /app

# Install PS
RUN apt-get update && apt-get install -y procps

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm install
COPY tsconfig.build.json ./
COPY tsconfig.json ./

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
CMD ["npm", "run","start:dev"]
