# Use an official GCC compiler as a parent image
FROM gcc:latest

# Set the working directory
WORKDIR /app

# Copy the runner script to the container
COPY crunner.sh /usr/local/bin/runner

# Convert to Unix line endings and make executable
RUN sed -i 's/\r$//' /usr/local/bin/runner && chmod +x /usr/local/bin/runner

# Make the runner script executable
RUN chmod +x /usr/local/bin/runner

# Use the script as the entry point
ENTRYPOINT ["runner"]
