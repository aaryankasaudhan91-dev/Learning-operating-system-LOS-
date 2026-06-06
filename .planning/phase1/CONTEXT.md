# Phase 1 Context: Foundation & Feature Lockdown

## Goal
To pivot the application's primary focus to the new Course Hub and disable legacy features while establishing the backend infrastructure for curriculum management.

## Acceptance Criteria
- [ ] `UnderConstruction` component is visually consistent with the app theme.
- [ ] Navigating to 'map', 'chamber', 'insights', 'cohort', or 'sos' displays the `UnderConstruction` component.
- [ ] Users land on the 'courses' view by default after login.
- [ ] `server.ts` has Mongoose models for `Course`, `Module`, and `Lesson`.
- [ ] `server.ts` provides POST/GET API routes for these models with robust error handling.
- [ ] MongoDB connection issues are fully resolved (verified by server start).

## Dependencies
- Successful MongoDB connection.
- `dotenv/config` included in `server.ts`.

## Out of Scope
- Actually building the UI for Course Hub (Phase 2).
- Seeding large volumes of data (Phase 2/3).
- React Router implementation (staying with current state-based routing).