#!/bin/bash

# Current directory of the script
DOCKERFILES_DIR="$(dirname "$0")"

# Array of Dockerfiles and their corresponding image names
declare -A docker_images=(
  ["Dockerfile.c"]="c-runner"
  ["Dockerfile.cpp"]="cpp-runner"
  ["Dockerfile.python"]="python-runner"
  ["Dockerfile.java"]="java-runner"
  ["Dockerfile.javascript"]="node"
  ["Dockerfile.r"]="r-runner"
  ["Dockerfile.go"]="go-runner"
  ["Dockerfile.php"]="php-runner"
  ["Dockerfile.ruby"]="ruby-runner"
  ["Dockerfile.perl"]="perl-runner"
)

# Loop through each Dockerfile and build the image
for dockerfile in "${!docker_images[@]}"; do
  image_name="${docker_images[$dockerfile]}"
  dockerfile_path="$DOCKERFILES_DIR/$dockerfile"
  
  if [[ -f "$dockerfile_path" ]]; then
    echo "Building $image_name from $dockerfile_path..."
    docker build -f "$dockerfile_path" -t "$image_name" .
    if [[ $? -ne 0 ]]; then
      echo "Error building $image_name. Exiting."
      exit 1
    fi
  else
    echo "Dockerfile $dockerfile_path not found. Skipping $image_name."
  fi
done

echo "All Docker images built successfully!"
