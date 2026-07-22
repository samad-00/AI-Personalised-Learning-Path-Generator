# Bug Fixes - Progress ✓

## Critical Bugs
- [x] **AuthContext** - Expose `setToken`/`setUser` so Login/Register can use them
- [x] **Login.jsx** - Fix to use AuthContext's `login()` method, change form from "USERNAME" to "EMAIL"
- [x] **Register.jsx** - Fix to use exposed `setToken`/`setUser`, update registration flow
- [x] **App.jsx** - Move catch-all `*` route to end (after SharedRoadmap)
- [x] **api.js** - Fix `getSharedRoadmap` to use consistent API instance
- [x] **RoadmapDetail.jsx** - Remove unused `searchResource` import

## Theme Integration
- [x] **Login.jsx** - Integrate with ThemeContext for dark mode support
- [x] **Register.jsx** - Integrate with ThemeContext for dark mode support

