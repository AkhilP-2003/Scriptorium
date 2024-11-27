# Use an official GCC compiler as a parent image
FROM gcc:latest

# Set the working directory
WORKDIR /app

# Use a script to compile and run the C++ code
COPY cpprunner.sh /usr/local/bin/cprun
RUN sed -i 's/\r$//' /usr/local/bin/cprun
RUN chmod +x /usr/local/bin/cprun

# Set the entry point to the run script
ENTRYPOINT ["cprun"]
