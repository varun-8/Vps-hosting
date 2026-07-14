#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Pulling latest code..."
git pull origin main

echo "Installing backend dependencies..."
cd backend
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Building frontend..."
npm run build

echo "Restarting backend with PM2..."
cd ..
# If it's the first time, use 'pm2 start', otherwise 'pm2 reload'
pm2 reload vps-hosting-backend || pm2 start ecosystem.config.js

echo "Deployment successful!"
