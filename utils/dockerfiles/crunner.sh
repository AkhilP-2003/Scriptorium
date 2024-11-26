#!/bin/bash
# Compile the C program
gcc "$1" -o program.out
if [ $? -eq 0 ]; then
    # If compilation succeeds, run the program
    ./program.out
else
    # If compilation fails, exit with error
    exit 1
fi
