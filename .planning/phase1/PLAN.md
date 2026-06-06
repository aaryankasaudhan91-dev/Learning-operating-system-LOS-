# Phase 1 Plan: Foundation & Feature Lockdown

## Task Breakdown

### 1. Frontend: Feature Lockdown
- **T1.1: Create `src/components/UnderConstruction.tsx`**
  - Implement a clean, high-fidelity placeholder with Lucide icons.
  - Add a "Return to Course Hub" button that resets the view.
- **T1.2: Update `src/App.tsx` Routing Logic**
  - Update `setView` defaults in `useEffect` (auth state change) to 'courses'.
  - Map `map`, `chamber`, `insights`, `cohort`, and `sos` to the `UnderConstruction` component.
  - Update Sidebar/Navbar to reflect the Course Hub as the primary destination.

### 2. Backend: Schema & API Foundation
- **T2.1: Define Mongoose Models in `server.ts`**
  - Create `CourseModel`, `ModuleModel`, and `LessonModel` with `strict: false`.
- **T2.2: Implement API Routes in `server.ts`**
  - Add GET/POST routes for `/api/courses`.
  - Add GET/POST routes for `/api/courses/:courseId/modules`.
  - Add GET/POST routes for `/api/courses/:courseId/modules/:moduleId/lessons`.
  - Add detailed error logging (console.error) for all new routes.
- **T2.3: Resolve Environmental & Connection Issues**
  - Ensure `dotenv/config` is at the top of `server.ts`.
  - Verify MongoDB connection string in `.env` is correctly encoded.

### 3. Validation
- **V1: Verify Feature Lockdown**
  - Log in and confirm the default view is Course Hub.
  - Navigate to "Cognitive Map" via Sidebar and verify "Under Construction" appears.
- **V2: Verify API Health**
  - Start server and confirm "Connected to MongoDB successfully" message.
  - Use a simple `curl` or fetch test to confirm `/api/courses` returns 200 OK (even if empty).

## Verification Plan

### Automated Tests
- N/A for Phase 1 (Focus on manual verification of state-based routing).

### Manual Verification
1. **Auth Flow:** Log in -> View should be 'courses'.
2. **Lockout Flow:** Sidebar Click "Map" -> Component should be `UnderConstruction`.
3. **API Flow:** `curl http://localhost:3000/api/courses` should return `[]`.
4. **Backend Stability:** Check `npm run dev` output for any Mongoose errors.