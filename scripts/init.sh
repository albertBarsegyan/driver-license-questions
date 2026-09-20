#!/usr/bin/env bash

set -e

PROJECT_NAME="${1:-my-react-app}"

echo "======================================"
echo " React + React Router + shadcn/ui"
echo "======================================"
echo

# --------------------------------------------------
# 1. Check Node.js
# --------------------------------------------------

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed."
  echo "Install Node.js LTS first:"
  echo "https://nodejs.org/"
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm is not installed."
  exit 1
fi

echo "Node: $(node --version)"
echo "npm:  $(npm --version)"
echo

# --------------------------------------------------
# 2. Create latest React Router project
# --------------------------------------------------

echo "🚀 Creating React Router project..."

npx create-react-router@latest "$PROJECT_NAME"

cd "$PROJECT_NAME"

echo
echo "✅ React Router project created."
echo

# --------------------------------------------------
# 3. Install dependencies
# --------------------------------------------------

echo "📦 Installing dependencies..."

npm install

# Make sure latest React packages are installed
npm install react@latest react-dom@latest

echo
echo "✅ React installed:"
npm list react react-dom --depth=0 || true
echo

# --------------------------------------------------
# 4. Initialize shadcn/ui
# --------------------------------------------------

echo "🎨 Installing shadcn/ui..."

npx shadcn@latest init

echo
echo "✅ shadcn/ui initialized."
echo

# --------------------------------------------------
# 5. Add useful initial components
# --------------------------------------------------

echo "🧩 Adding initial shadcn components..."

npx shadcn@latest add button card input label

echo
echo "✅ Initial shadcn components installed."
echo

# --------------------------------------------------
# 6. Install React Router explicitly
# --------------------------------------------------

echo "🧭 Installing latest React Router..."

npm install react-router@latest

echo
echo "✅ React Router installed."
echo

# --------------------------------------------------
# 7. Final information
# --------------------------------------------------

echo "======================================"
echo " 🎉 PROJECT READY"
echo "======================================"
echo
echo "Project: $PROJECT_NAME"
echo
echo "React:"
npm list react --depth=0 2>/dev/null || true

echo
echo "React Router:"
npm list react-router --depth=0 2>/dev/null || true

echo
echo "Start development server:"
echo
echo "  cd $PROJECT_NAME"
echo "  npm run dev"
echo
echo "======================================"
