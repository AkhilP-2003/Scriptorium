# Use an official OpenJDK image as a parent image
FROM openjdk:11

# Set the working directory inside the container
WORKDIR /app

# Copy the Java code to the working directory

COPY javarunner.sh /usr/local/bin/javarunner
RUN sed -i 's/\r$//' /usr/local/bin/javarunner
RUN chmod +x /usr/local/bin/javarunner

# Set the entry point to a custom script to compile and run the Java code
ENTRYPOINT ["bash", "javarunner"]
