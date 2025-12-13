#!/bin/bash

echo "🚀 ProInspect Platform Setup Script"
echo "===================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v)
echo "✓ Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
echo "✓ npm version: $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment files
echo ""
echo "🔧 Setting up environment files..."

if [ ! -f packages/gateway/.env ]; then
    cp packages/gateway/.env.example packages/gateway/.env
    echo "✓ Created packages/gateway/.env"
else
    echo "✓ packages/gateway/.env already exists"
fi

if [ ! -f packages/web/.env.local ]; then
    echo "VITE_API_URL=http://localhost:3001" > packages/web/.env.local
    echo "VITE_APP_NAME=ProInspect Platform" >> packages/web/.env.local
    echo "✓ Created packages/web/.env.local"
else
    echo "✓ packages/web/.env.local already exists"
fi

# Create service environment files
for service in media-storage background-jobs billing audit notifications report-generation knowledge-standards identity white-label; do
    if [ ! -f services/$service/.env ]; then
        echo "PORT=300X" > services/$service/.env
        echo "NODE_ENV=development" >> services/$service/.env
        echo "SERVICE_SECRET=dev-secret" >> services/$service/.env
        echo "✓ Created services/$service/.env"
    fi
done

echo ""
echo "🐳 Docker Services"
echo "=================="

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✓ Docker is installed"
    
    read -p "Start Docker services? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting PostgreSQL and Redis..."
        docker-compose up -d postgres redis
        
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
        
        echo ""
        echo "🗃️ Database Setup"
        echo "================="
        
        # Generate Prisma client
        echo "Generating Prisma client..."
        cd packages/gateway
        npx prisma generate
        
        # Run migrations
        echo "Running database migrations..."
        npx prisma migrate dev --name init
        
        cd ../..
        echo "✓ Database setup complete"
    fi
else
    echo "⚠️ Docker not found. Please install Docker to run services."
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev           # Start all services"
echo "  npm run dev:web       # Start web app only"
echo "  npm run dev:gateway   # Start gateway only"
echo ""
echo "Web Application:  http://localhost:5173"
echo "Gateway API:      http://localhost:3001"
echo "API Documentation: http://localhost:3001/docs"
echo ""