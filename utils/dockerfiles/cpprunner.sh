#!/bin/bash

# Get the file name from the first argument
fileName=$1

# Compile the C++ code
g++ "$fileName" -o output

# Check if compilation was successful
if [ $? -eq 0 ]; then
    # Run the compiled output
    ./output
else
    echo "Compilation failed!"
fi
