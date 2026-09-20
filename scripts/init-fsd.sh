
#!/usr/bin/env bash

set -e

echo "======================================"
echo " FSD Folder Structure Initializer"
echo "======================================"
echo

# Make sure we're inside a project
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found."
  echo "Run this script from the root of your React project."
  exit 1
fi

echo "📁 Creating Feature-Sliced Design structure..."

mkdir -p src/

# ----------------------------------------
# App
# ----------------------------------------

mkdir -p src/app

touch src/app/.gitkeep

# ----------------------------------------
# Pages
# ----------------------------------------

mkdir -p src/pages

touch src/pages/.gitkeep

# ----------------------------------------
# Widgets
# ----------------------------------------

mkdir -p src/widgets

touch src/widgets/.gitkeep

# ----------------------------------------
# Features
# ----------------------------------------

mkdir -p src/features

touch src/features/.gitkeep

# ----------------------------------------
# Entities
# ----------------------------------------

mkdir -p src/entities

touch src/entities/.gitkeep

# ----------------------------------------
# Shared
# ----------------------------------------

mkdir -p src/shared

mkdir -p src/shared/ui
mkdir -p src/shared/lib
mkdir -p src/shared/api
mkdir -p src/shared/config
mkdir -p src/shared/assets
mkdir -p src/shared/types
mkdir -p src/shared/hooks

touch src/shared/ui/.gitkeep
touch src/shared/lib/.gitkeep
touch src/shared/api/.gitkeep
touch src/shared/config/.gitkeep
touch src/shared/assets/.gitkeep
touch src/shared/types/.gitkeep
touch src/shared/hooks/.gitkeep

# ----------------------------------------
# FSD README
# ----------------------------------------

cat > src/README.md <<'EOF'
# Feature-Sliced Design

## Layers

### app
Application initialization and global configuration.

Examples:
- providers
- router
- global styles
- error boundaries
- application configuration

### pages
Complete application pages.

Examples:
- home
- dashboard
- login
- profile

### widgets
Large reusable UI blocks composed from entities/features.

Examples:
- header
- sidebar
- user-profile
- product-list
- dashboard-overview

### features
User interactions and business actions.

Examples:
- auth-by-email
- add-to-cart
- create-order
- change-password
- upload-avatar

### entities
Business domain objects.

Examples:
- user
- product
- order
- project
- invoice

### shared
Reusable code without business-domain knowledge.

Examples:
- UI components
- API clients
- utilities
- hooks
- types
- configuration
- assets
EOF

echo
echo "✅ FSD structure created."
echo

echo "======================================"
echo " Structure"
echo "======================================"

find src -type d | sort

echo
echo "======================================"
echo " 🎉 Done"
echo "======================================"
echo
