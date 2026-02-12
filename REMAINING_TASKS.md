# GharBhada project: Remaining Tasks & Corrections

Based on your project requirements and the current state of the codebase, here is a detailed breakdown of what is already done and what still needs to be implemented or corrected.

## 1. User Registration & Authentication
*   [x] **Tenant/Owner Roles**: Implemented.
*   [x] **ID Proof Upload**: Implemented (Citizenship/ID upload during registration).
*   [x] **Admin Approval**: Implemented (Accounts remain 'pending' until admin approves).
*   [ ] **Refinement**: Ensure that Google Login users are also forced to upload ID proof and wait for approval.

## 2. Property Listing (Owner)
*   [x] **Basic Details**: BHK, Type, Rent, Photos, Rules.
*   [x] **Utility Bills**: Electricity unit rate, Water bill, and Garbage bill fields are present.
*   [x] **Admin Approval**: Newly added properties default to 'pending' and require admin approval.
*   [ ] **Trusted Owner Logic (CRITICAL CORRECTION)**: 
    *   **Current State**: The system counts an owner as "trusted" after **1 month**.
    *   **User Idea**: You planned for **1 year** (trusted) vs **regular owner**.
    *   **Action**: Change logic to use 12 months/1 year for trust calculation.

## 3. Booking & Agreement Flow
*   [x] **Tenant Search**: Implemented with filters.
*   [x] **Book Now Form**: Implemented (Collects tenant full name, phone, address, and citizen number).
*   [x] **Duration Selection**: The "Years/Months" counter (e.g., 3 years 4 months) logic is implemented.
*   [x] **Owner Approval**: Owner can approve the booking request.
*   [ ] **Agreement Display**:
    *   **Action**: Ensure the final agreement modal explicitly shows the total breakdown: `Rent + Electricity (per unit) + Water + Garbage`.
    *   **Action**: Show the **Owner's Bank Details** clearly to the tenant during the deposit stage (5000 NPR).

## 4. Payment & Management
*   [x] **Deposit Payment**: Logic for 5000 NPR deposit exists.
*   [ ] **Monthly Rent Due Calculation**:
    *   **Requirement**: "In the end of the month they need to pay the due amount like the rent is 25000 and after the deposit it will be 20000 plus the electricity with water and garbage".
    *   **Action**: Ensure the month-end calculation subtracts the deposit if applicable for the first month.
*   [x] **Payment History**: Basic payment tracking exists.

## 5. Admin Role (Overall Control)
*   [x] **User Management**: Approve/Remove/Suspend users.
*   [x] **Property Management**: Approve/Remove listings.
*   [ ] **Payment Monitoring**: Add a detailed transaction list to the admin dashboard.

---

## Technical Corrections Needed:
1.  **Trust Level Interval**: Change `INTERVAL 1 MONTH` to `INTERVAL 1 YEAR` in SQL queries.
2.  **Notification triggers**: Audit triggers for all flow status changes.
3.  **Owner Profile**: Ensure bank details can be updated in the profile.
