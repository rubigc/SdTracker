# Ask for Showdown username
$username = Read-Host "Enter your Showdown username"

# Set environment variable and start containers
$env:SHOWDOWN_USERNAME = $username
docker-compose up -d

Write-Host "Containers started with username: $username"
Write-Host "Frontend available at http://localhost:3000"