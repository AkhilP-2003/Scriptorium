# Use the official Node.js image from Docker Hub
FROM node:16-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container

# Set the entry point to run the JavaScript file using Node.js
ENTRYPOINT ["node"]
