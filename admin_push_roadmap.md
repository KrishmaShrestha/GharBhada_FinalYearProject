# Admin Dashboard Git Push Roadmap (3 Days)

This roadmap outlines a step-by-step plan to push the Admin Dashboard functionality to your Git repository over 3 days, ensuring logical commits and a clean history.

---

## 🛠️ Prerequisites
Before starting, ensure you are on the correct branch (e.g., `main` or `develop`).
```bash
git checkout main
git pull origin main
```

---

## 📅 Day 1: Backend Infrastructure & API Services
**Goal:** Push the core backend logic, routes, and the frontend service layer that connects to the API.

### Steps:
1. **Prepare Backend Admin Logic:**
   - Add routes and controllers for user/property management.
   - Include any migration or setup scripts.
2. **Setup Frontend Service Layer:**
   - Add `adminService.js` to handle API calls.

### Commands:
```bash
# 1. Add Backend Files
git add backend/src/routes/adminRoutes.js
git add backend/src/controllers/adminController.js
git add backend/setup-admin.js
git add backend/scripts/migrateAdminFeatures.js

# 2. Add Frontend Service
git add frontend/src/services/adminService.js

# 3. Commit and Push
git commit -m "feat(admin): implement backend routes, controllers and frontend service layer"
git push origin main
```

---

## 📅 Day 2: Dashboard UI & Analytics
**Goal:** Push the main dashboard page layout, navigation tabs, and the statistics/analytics visualization.

### Steps:
1. **Add Admin UI Components:**
   - Push the `StatCard` and any shared UI elements used by the dashboard.
2. **Implement Main Page & Analytics:**
   - Push the `AdminDashboard.jsx` file with "Overview" and "Analytics" tabs active.
   - Include chart configurations and stat grids.

### Commands:
```bash
# 1. Add Components
git add frontend/src/components/admin/StatCard.jsx
git add frontend/src/components/common/Badge.jsx
git add frontend/src/components/common/Modal.jsx
git add frontend/src/components/common/Skeleton.jsx

# 2. Add Dashboard Page (Layout & Analytics)
git add frontend/src/pages/AdminDashboard.jsx

# 3. Commit and Push
git commit -m "feat(admin): add dashboard layout, navigation tabs and analytics overview"
git push origin main
```

---

## 📅 Day 3: Management Features & Action Modals
**Goal:** Push the "User Management" and "Property Management" features, including approval/rejection logic and action modals.

### Steps:
1. **Enable Management Tabs:**
   - Update `AdminDashboard.jsx` with full logic for User and Property listing/filtering.
2. **Add Action Modals:**
   - Push modals for adding properties, creating agreements, and recording payments.
3. **Final Polish:**
   - Any small fixes or styling improvements.

### Commands:
```bash
# 1. Add Management Modals
git add frontend/src/components/admin/AddPropertyModal.jsx
git add frontend/src/components/admin/CreateAgreementModal.jsx
git add frontend/src/components/admin/RecordPaymentModal.jsx

# 2. Finalize Dashboard (Include all sub-tab logic)
git add frontend/src/pages/AdminDashboard.jsx

# 3. Commit and Push
git commit -m "feat(admin): implement user and property management with action modals"
git push origin main
```

---

## 💡 Summary of Commit Strategy
| Day | Focus Area | Key Files |
| :--- | :--- | :--- |
| **Day 1** | Backend & Services | `adminRoutes.js`, `adminController.js`, `adminService.js` |
| **Day 2** | Dashboard & Stats | `AdminDashboard.jsx` (Layout), `StatCard.jsx`, `Badge.jsx` |
| **Day 3** | Logic & Modals | `AddPropertyModal.jsx`, `Management Logic` |

---
> [!TIP]
> Always run your tests (if any) before pushing to ensure Day 1's backend changes don't break existing login/auth flows!
