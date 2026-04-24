#!/bin/bash

# ============================================
# AI Blood Bank & Donation Center Manager
# Start Script
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${RED}"
echo "╔══════════════════════════════════════════════════╗"
echo "║   🏥 AI Blood Bank & Donation Center Manager    ║"
echo "║        Starting Application Services...         ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ============================================
# Kill processes on used ports
# ============================================
echo -e "\n${YELLOW}🔧 Cleaning up ports...${NC}"

kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}  Killing process(es) on port $port...${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}  ✓ Port $port freed${NC}"
  else
    echo -e "${GREEN}  ✓ Port $port is available${NC}"
  fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# ============================================
# Check PostgreSQL
# ============================================
echo -e "\n${YELLOW}🐘 Checking PostgreSQL...${NC}"
if command -v pg_isready &> /dev/null; then
  if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ PostgreSQL is running${NC}"
  else
    echo -e "${YELLOW}  Starting PostgreSQL...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
    fi
    sleep 2
    if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
      echo -e "${GREEN}  ✓ PostgreSQL started${NC}"
    else
      echo -e "${RED}  ✗ Could not start PostgreSQL. Please start it manually.${NC}"
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}  ⚠ pg_isready not found. Assuming PostgreSQL is running.${NC}"
fi

# ============================================
# Create database if not exists
# ============================================
echo -e "\n${YELLOW}📦 Setting up database...${NC}"
DB_NAME=${DB_NAME:-bloodbank}
DB_USER=${DB_USER:-postgres}

if psql -U "$DB_USER" -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "${GREEN}  ✓ Database '$DB_NAME' exists${NC}"
else
  echo -e "${YELLOW}  Creating database '$DB_NAME'...${NC}"
  createdb -U "$DB_USER" -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" "$DB_NAME" 2>/dev/null || true
  echo -e "${GREEN}  ✓ Database '$DB_NAME' created${NC}"
fi

# ============================================
# Install backend dependencies
# ============================================
echo -e "\n${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
  npm install
  echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"
else
  echo -e "${GREEN}  ✓ Backend dependencies already installed${NC}"
fi

# ============================================
# Install frontend dependencies
# ============================================
echo -e "\n${YELLOW}📦 Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  npm install
  echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"
else
  echo -e "${GREEN}  ✓ Frontend dependencies already installed${NC}"
fi

# ============================================
# Seed database
# ============================================
echo -e "\n${YELLOW}🌱 Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node seeds/seed.js
echo -e "${GREEN}  ✓ Database seeded successfully${NC}"

# ============================================
# Start backend with nodemon (auto-reload)
# ============================================
echo -e "\n${CYAN}🚀 Starting backend on port $BACKEND_PORT (with auto-reload)...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ Backend starting (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "${YELLOW}  Waiting for backend...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend is ready!${NC}"
    break
  fi
  sleep 1
done

# ============================================
# Start frontend (with auto-reload via react-scripts)
# ============================================
echo -e "\n${CYAN}🚀 Starting frontend on port $FRONTEND_PORT (with auto-reload)...${NC}"
cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!
echo -e "${GREEN}  ✓ Frontend starting (PID: $FRONTEND_PID)${NC}"

# ============================================
# Done!
# ============================================
echo -e "\n${GREEN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║        🎉 Application Started Successfully!     ║"
echo "║                                                  ║"
echo "║  Frontend:  http://localhost:$FRONTEND_PORT          ║"
echo "║  Backend:   http://localhost:$BACKEND_PORT          ║"
echo "║                                                  ║"
echo "║  Login:     admin@bloodbank.com / admin123       ║"
echo "║  (Or use the Quick Login button)                 ║"
echo "║                                                  ║"
echo "║  Both servers auto-reload on code changes!       ║"
echo "║  Press Ctrl+C to stop all services.              ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Trap to cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  kill_port $BACKEND_PORT
  kill_port $FRONTEND_PORT
  echo -e "${GREEN}✓ All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running
wait
