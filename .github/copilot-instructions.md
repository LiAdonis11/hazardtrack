# Copilot Instructions for hazardTrackV2

## Project Overview
- This is a multi-component hazard tracking system with PHP backend APIs, a React Native/Expo mobile app, and an admin dashboard (React + Vite).
- Data flows from mobile clients (hazardtrack-app) to backend PHP APIs (in `/api/`), with MySQL as the database (see `db.php`).
- Attachments and images are stored in `/uploads/` and referenced by file paths in the database.

## Key Directories & Files
- `hazardtrack-app/` — React Native/Expo app. Entry: `app/(tabs)/index.tsx`, uses Tamagui for UI, Expo Router for navigation.
- `api/` — PHP backend endpoints. Each file is a REST-like API (e.g., `get_reports.php`, `add_photo_note.php`).
- `hazardtrack-admin/` — Admin dashboard (React + Vite).
- `assets/` — Shared static assets (images, etc.).
- `uploads/` — User-uploaded files/images.

## Developer Workflows
- **Mobile App:**
  - Start with `npx expo start --clear` in `hazardtrack-app/`.
  - Use Expo Router for navigation; routes are defined by file structure under `app/`.
  - Tamagui is used for UI components; custom components are in `components/`.
  - For images, use `require('../../assets/logo.png')` or `import logo from '../../assets/logo.png'`.
- **Backend:**
  - PHP scripts connect to MySQL via `db.php`. Credentials are hardcoded for local dev (XAMPP defaults).
  - Test endpoints with Postman or direct browser requests.
- **Admin Dashboard:**
  - Standard React + Vite workflow. See `hazardtrack-admin/README.md` for details.

## Patterns & Conventions
- **API:** Each PHP file in `/api/` is a single endpoint. Use prepared statements for DB access.
- **Mobile:** Use Tamagui props for styling; avoid deprecated React Native props. Utility files (`lib/`, `styles/`) should be outside `app/` to avoid Expo Router warnings.
- **Images:** Store in `/uploads/` (user uploads) or `/assets/images/` (static). Reference by relative path in DB/API.
- **Error Handling:** PHP APIs return JSON with `success` and `message` fields. Mobile app expects this format.

## External Dependencies
- **Mobile:** Tamagui, Expo Router, Expo Linear Gradient, React Native Web.
- **Backend:** MySQL, TCPDF (for PDF generation in `vendor/`).

## Example: Adding a New API Endpoint
1. Create `api/new_endpoint.php`.
2. Use `include 'db.php'` for DB access.
3. Return JSON response with `success` and `message`.

## Example: Adding a New Screen to Mobile App
1. Add a new file under `hazardtrack-app/app/(tabs)/`.
2. Export a default React component.
3. Use Tamagui for UI, Expo Router for navigation.

## Testing & Debugging
- Use XAMPP for local MySQL/PHP.
- Use Expo Go or device simulator for mobile app.
- Console logs and PHP errors are the main debugging tools.

---

If any section is unclear or missing, please provide feedback to improve these instructions.