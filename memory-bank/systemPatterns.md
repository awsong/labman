# LabMan System Patterns

## Frontend Architecture

- Vue.js 3 Composition API
- Vite build system
- Component-based structure:
  - Layout components (AppHeader, AppSidebar)
  - Project management components
  - Chart visualization components
  - UI components (SwitchComponent)

## State Management

- Vuex stores for:
  - Authentication (auth.js)
  - Projects (project.js)
  - Milestones (milestone.js)
  - Progress tracking (progress.js)
  - Theme management (theme.js)

## Routing

- Vue Router with multiple views:
  - Dashboard
  - Project management
  - Milestone tracking
  - Statistics
  - Settings

## Backend Architecture

- Node.js server (server.js)
- SQLite database (labman.db)
- RESTful API endpoints
- File upload handling (uploads/)
