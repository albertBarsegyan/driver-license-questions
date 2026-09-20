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
