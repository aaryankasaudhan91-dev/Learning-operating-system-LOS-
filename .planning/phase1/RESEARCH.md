# Phase 1 Research: Foundation & Feature Lockdown

## Current System State
- **Frontend:** React + Vite. Routing is handled by a simple `currentView` state in `App.tsx`.
- **Backend:** Node.js + Express + Mongoose. Models exist for `UserProfile` and `Task`.
- **Database:** MongoDB Atlas (connection string fixed with URL encoding for `#`).
- **Feature Set:** Includes `map`, `chamber`, `insights`, `cohort`, and `sos`. These are the targets for the "Under Construction" lockout.

## Component Implementation
- **UnderConstruction.tsx:** Needs to be a high-fidelity placeholder. It should use `lucide-react` icons (e.g., `Hammer`) and maintain the "Synapse" aesthetic (glass panels, electric cyan/plasma violet palette).
- **App.tsx:** The logic for `setView` needs to be updated. When a user logs in, they should land on `courses` instead of `map` or `insights`.

## Data Schema (Mongoose)
- **CourseModel:** Top-level. Needs fields: `id`, `classLevel`, `subject`, `title`, `description`, `order`.
- **ModuleModel:** Linked to Course. Needs fields: `id`, `courseId`, `term`, `title`, `learningObjectives` (Array), `order`.
- **LessonModel:** Linked to Module. Needs fields: `id`, `moduleId`, `month`, `theme`, `topic`, `learningOutcome`, `instructionalFlow` (Array of objects), `resources` (Array), `order`.

## API Routes (server.ts)
- Need CRUD endpoints for all three new entities.
- Must support `findOneAndUpdate` with `upsert: true` for the seeding script.
- Error handling should be detailed to avoid silent failures (as seen in previous attempts).

## Dependencies
- `lucide-react` for icons.
- `framer-motion` (or `motion/react`) for animations.
- `dotenv` for environment variable management.

## Risks & Mitigations
- **Risk:** Seeding script failure due to server errors.
- **Mitigation:** Add explicit console logs in `server.ts` to capture Mongoose validation or connection errors.
- **Risk:** Broken routing during transition.
- **Mitigation:** Thoroughly test `App.tsx` state transitions after updating `currentView` defaults.