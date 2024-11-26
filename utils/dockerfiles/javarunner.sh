#!/bin/bash

# Compile the Java code
javac /app/"$1".java


# Check if compilation was successful
if [ $? -eq 0 ]; then
    # Run the Java program if compilation succeeded
    java "$1"
else
    # Print an error message if compilation failed
    echo "Compilation failed."
    javac "$1".java 2>&1
fi
