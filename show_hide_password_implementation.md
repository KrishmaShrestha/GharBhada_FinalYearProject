# Password Show/Hide Feature Implementation

This document summarizes the implementation of the show/hide password toggle feature across the GharBhada application.

## Overview
A toggle button with an eye icon has been added to all password input fields in the authentication flow. This allows users to verify their input before submission, improving the user experience and reducing login/registration errors.

## Implementation Details
- **Library used**: `react-icons/fa` (Font Awesome icons)
- **Icons used**:
    - `FaEye`: Shown when the password text is **visible**.
    - `FaEyeSlash`: Shown when the password text is **hidden**.
- **State Management**: Local component state (`showPassword`, `showConfirmPassword`) manages the visibility toggle for each input field.

## Files Modified
1. **[Login.jsx](frontend/src/pages/Login.jsx)**: Added toggle to the main login password field.
2. **[Register.jsx](frontend/src/pages/Register.jsx)**: Added toggles to both Password and Confirm Password fields.
3. **[ResetPassword.jsx](frontend/src/pages/ResetPassword.jsx)**: Added toggles to New Password and Confirm New Password fields.

## How to use
Simply click the eye icon on the right side of any password field to toggle the visibility of the text.
