# Owner Feature Push Roadmap (4 Days) - Revised

This roadmap outlines the step-by-step process to push the **Owner Dashboard** features over 4 days, prioritizing the **Frontend Design** first as requested.

## Day 1: Frontend UI & Design
*Focus: Pushing the layouts, pages, and styling for the owner dashboard.*

### Tasks:
1.  **Dashboard Page**: Push the main Owner Dashboard layout.
2.  **Global Styling**: Push Tailwind and CSS updates for the new designs.
3.  **UI Components**: Push cards and modals used in the owner view.

### Git Commands:
```bash
# 1. Add and commit owner dashboard layout
git add frontend/src/pages/OwnerDashboard.jsx
git commit -m "feat(ui): implement owner dashboard layout and design"

# 2. Add and commit styling configurations
git add frontend/tailwind.config.js frontend/src/index.css
git commit -m "style: update tailwind and css for owner dashboard"

# 3. Add shared owner components
git add frontend/src/components/common/TenantPropertyCard.jsx
git commit -m "feat(ui): add owner-specific UI components"

# 4. Push Day 1 changes
git push origin main
```

---

## Day 2: Frontend Logic & API Services
*Focus: Connecting the UI to the service layer and managing state.*

### Tasks:
1.  **API Services**: Push the owner-specific API calls.
2.  **Context & Auth**: Push updates to AuthContext or main entry points if they handle owner state.
3.  **Tenant Services**: Push related tenant services needed for owner-tenant interaction.

### Git Commands:
```bash
# 1. Add and commit frontend services
git add frontend/src/services/ownerService.js frontend/src/services/api.js
git commit -m "feat(frontend): implement owner API service layer"

# 2. Add and commit other related services
git add frontend/src/services/tenantService.js
git commit -m "feat(frontend): add tenant service for owner interactions"

# 3. Add frontend entry point updates
git add frontend/src/App.jsx frontend/src/main.jsx
git commit -m "feat(frontend): integrate owner routes and services in App"

# 4. Push Day 2 changes
git push origin main
```

---

## Day 3: Backend Infrastructure & Database
*Focus: Implementing the data layer and server-side logic.*

### Tasks:
1.  **Database Migration**: Push the SQL schema for owner tables and views.
2.  **Server Config**: Push backend package updates and server initialization.
3.  **Owner Controller**: Push the core logic for processing owner requests.

### Git Commands:
```bash
# 1. Add and commit database schema
git add database/owner_dashboard_schema.sql
git commit -m "feat(db): add owner dashboard tables and statistics views"

# 2. Add and commit backend logic
git add backend/src/controllers/ownerController.js backend/src/routes/ownerRoutes.js
git commit -m "feat(backend): implement owner controller and routes"

# 3. Push Day 3 changes
git push origin main
```

---

## Day 4: Final Integration & Cleanup
*Focus: Scripts, configurations, and minor fixes.*

### Tasks:
1.  **Migration Scripts**: Push scripts for adding verification fields or data migration.
2.  **Config Files**: Push Vite or other environment configurations.
3.  **Final Cleanup**: Push anything remaining to ensure the feature is complete.

### Git Commands:
```bash
# 1. Add and commit backend scripts and configs
git add backend/scripts/addVerificationFields.js backend/package.json
git commit -m "chore: add migration scripts and update backend dependencies"

# 2. Add remaining frontend configs
git add frontend/vite.config.js
git commit -m "chore: update vite configuration"

# 3. Final push for remaining files
git add .
git commit -m "feat(owner): finalize owner dashboard integration"
git push origin main
```

---

> [!NOTE]
> **Why this order?** 
> By pushing the **Frontend Design** first (Day 1 & 2), you ensure the visual part is repository-safe. Even though the backend isn't pushed yet, the design is preserved. Days 3 and 4 complete the "brain" of the application to make it functional.
