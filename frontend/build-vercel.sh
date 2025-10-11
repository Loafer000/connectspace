#!/bin/bash
set -e
echo "Starting Vercel build..."
chmod +x node_modules/.bin/*
node_modules/.bin/react-scripts build
