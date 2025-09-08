#!/bin/bash

# Ask for Showdown username
read -p "Enter your Showdown username: " username

# Export variable and start containers
export SHOWDOWN_USERNAME=$username
docker-compose up -d

echo "Containers started with username: $username"
echo "Frontend available at http://localhost:3000"