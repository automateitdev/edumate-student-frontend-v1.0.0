#!/bin/bash
set -e  # Exit immediately if a command fails

echo "Deployment started..."

# Ensure script runs in the correct directory
cd /home/dev/web/student.edufee.online/public_html || { echo "Directory not found!"; exit 1; }

# Fetch the latest code
echo "Pulling latest changes..."
git pull origin develop || { echo "Git pull failed!"; exit 1; }

# Install dependencies
echo "Installing npm dependencies..."
npm install || { echo "npm install failed!"; exit 1; }

# Generating static build
echo "Generating static build..."
npm run generate || { echo "npm run generate failed!"; exit 1; }

echo "Dev Deployment finished successfully!"
