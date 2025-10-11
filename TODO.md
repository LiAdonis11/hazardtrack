# TODO: Add Confirm New Password in Resident Profile

## Tasks
- [x] Add state for confirmNewPassword in Profile.tsx
- [x] Add confirm new password input field in the password change sheet
- [x] Update validation to check password match and all fields filled
- [x] Test the change password functionality (fixed 401 error by sending token in request body)

## Add Eye Icon Toggles for Password Visibility in ProfileScreen

- [x] Update imports to include KeyboardAvoidingView, Platform, Keyboard, api functions, and storage functions
- [x] Add state hooks for sheet visibility, passwords, visibility toggles, and keyboard detection
- [x] Add keyboard event listeners for keyboardShown state
- [x] Update Change Password and Delete Account buttons to open sheets
- [x] Implement Change Password Sheet with eye icons for current, new, and confirm passwords
- [x] Implement Delete Account Sheet with eye icon for password
- [x] Test the sheets open/close and eye icon toggles

## Add Visible Password Rules in Register Screen

- [x] Add useEffect import and FontAwesome import
- [x] Add passwordRules state to track password requirements
- [x] Add useEffect to check password rules as user types
- [x] Add password rules display between password and confirm password inputs
- [x] Add styles for password rules container, title, and individual rules
- [x] Update validation to check all password requirements
- [x] Test the password rules display and validation

## Implement Admin Notifications System

- [x] Add admin notifications for new user registration in register.php
- [x] Add admin notifications for account deletion in delete_account.php
- [x] Add admin notifications for report submission in report_hazard.php
- [x] Test that notifications are created for all active admin users
- [x] Verify notification content includes relevant details (user info, report numbers, etc.)

## Fix Image Upload Path Issue

- [x] Identify that images were being saved to api/uploads/ instead of uploads/
- [x] Change upload_dir from 'uploads/' to '../uploads/' in report_hazard.php
- [x] Fix image_path storage to be relative to root (remove '../' prefix)
- [x] Test that images are now saved to correct location and accessible via correct URL
