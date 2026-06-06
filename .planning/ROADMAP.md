# Project Roadmap

## Phase 1: Foundation & Feature Lockdown
- [ ] Implement `UnderConstruction` component.
- [ ] Update `App.tsx` routing and default view to `courses`.
- [ ] Define Mongoose schemas for `Course`, `Module`, and `Lesson`.
- [ ] Implement CRUD API routes in `server.ts`.

## Phase 2: Curriculum Seeding
- [ ] Structure Class 1 & 2 curriculum data into `seed-data.json`.
- [ ] Debug MongoDB connection issues (URL encoding, etc.).
- [ ] Execute seeding script and verify database integrity.

## Phase 3: Course Hub UI Development
- [ ] Build Class/Subject selection interface.
- [ ] Build Module details and Learning Objectives display.
- [ ] Build interactive Lesson Plan view.
- [ ] Connect frontend components to `dbService`.

## Phase 4: Full Spectrum Expansion
- [ ] Extract and seed remaining grades (3, 6, 8, 10, 11, 12).
- [ ] Add "Download Syllabus PDF" placeholder functionality.
- [ ] Final UI polish and responsive testing.