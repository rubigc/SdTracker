# Stage 1: Build Go backend
FROM golang:1.21 as go-builder
WORKDIR /app
COPY gobackend/ .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o sdtracker ./cmd/sdtracker
RUN CGO_ENABLED=0 GOOS=linux go build -o initdb ./cmd/database

# Stage 2: Build Node.js backend
FROM node:18 as node-builder
WORKDIR /app
COPY website/backend/ .
RUN npm install

# Stage 3: Build React frontend
FROM node:18 as react-builder
WORKDIR /app
COPY website/frontend/ .
RUN npm install
RUN npm run build

# Final stage
FROM alpine:latest
WORKDIR /app

# Install dependencies
RUN apk add --no-cache nodejs sqlite

# Copy binaries
COPY --from=go-builder /app/sdtracker /app/sdtracker
COPY --from=go-builder /app/initdb /app/initdb
COPY --from=node-builder /app /app/backend
COPY --from=react-builder /app/build /app/frontend

# Copy data files
COPY gobackend/data /app/data
COPY run_all.sh /app/
RUN mkdir -p /app/database
COPY pokemon_stats.db /app/database/

# Setup initialization script
RUN echo '#!/bin/sh\n\
if [ ! -f "$DB_PATH" ]; then\n\
  echo "Initializing database..."\n\
  ./initdb\n\
  mv /app/pokemon_stats.db $DB_PATH\n\
fi\n\
\n\
echo "Starting services..."\n\
node /app/backend/server.js &\n\
./sdtracker\n\
' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8089 3000 3001
CMD ["/app/start.sh"]