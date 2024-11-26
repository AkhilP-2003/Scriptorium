FROM golang:latest

WORKDIR /app

ENTRYPOINT ["go", "run"]
