# Project State

## Current Context
The project is in the initialization phase. The goal is to pivot from a telemetry-focused platform to a curriculum-centric "Course Hub" based on CBSE/NEP 2020 guidelines.

## Milestones
- [x] GSD Project Initialized.
- [x] .planning documentation created.
- [x] PDF Framework Researched.
- [ ] Phase 1 Implementation.

## Critical Issues
- MongoDB connection string in `.env` required URL encoding for special characters (fixed).
- Server error encountered during initial seeding attempt (needs investigation).

## Recent Decisions
- Decided to put all legacy features Under Construction to simplify the MVP focus.
- Chose "New Firestore/MongoDB Entities" over local state for course management to ensure scalability.