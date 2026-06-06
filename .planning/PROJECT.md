# CBSE & NEP 2020 Course Design Project

## Project Context
Digitizing the CBSE & NEP 2020 course blueprints provided in the "Course Design_ CBSE & NEP 2020 Framework" document. The goal is to provide a structured educational platform for students across multiple grades (1-3, 6, 8, 10-12) while focusing strictly on Course Hub functionality for now.

## Project Objectives
- Implement a hierarchical Course Hub (Class > Subject > Module > Lesson).
- Digitize learning objectives, syllabus breakdowns, and lesson plans from the PDF.
- Pivot existing features (Insights, Maps, etc.) to an "Under Construction" state to focus user attention on the new curriculum modules.

## Tech Stack
- **Frontend:** React (TypeScript), Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js (Express), Mongoose (MongoDB).
- **Architecture:** Local API proxying to a MongoDB Atlas cluster.
- **State Management:** React hooks + Firebase Auth for user context.

## Constraints & Assumptions
- All non-course features must redirect to or show an "Under Construction" component.
- Course data will be seeded into MongoDB using a structured JSON format extracted from the PDF.
- The UI must maintain the "Synapse" aesthetic: high-fidelity, futuristic, and education-focused.