# Render Build Script
# This file helps Render understand how to build the backend

echo "🔧 Starting Render build process..."

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run any build steps if needed
echo "🏗️ Build completed successfully!"

echo "✅ Backend ready for deployment on Render"