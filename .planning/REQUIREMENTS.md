# Scoped Requirements

## 1. Feature Lockdown ("Under Construction")
- **REQ-1.1:** Build a centralized `UnderConstruction` component with high-fidelity visuals.
- **REQ-1.2:** Update `App.tsx` routing to replace the following views with `UnderConstruction`:
  - Cognitive Map (`map`)
  - Focus Chamber (`chamber`)
  - Insights Hub (`insights`)
  - Cohort Telemetry (`cohort`)
  - SOS Toolkit (`sos`)
- **REQ-1.3:** Sidebar and Navbar must reflect this shift, defaulting users to the "Course Hub".

## 2. Hierarchical Course Hub
- **REQ-2.1:** Class Selection: User chooses from grade levels (1-3, 6, 8, 10-12).
- **REQ-2.2:** Subject Selection: User chooses subjects based on the grade level (English, Math, EVS, Science, etc.).
- **REQ-2.3:** Course Details View:
  - Display Learning Objectives (3-Term Structure).
  - Display Syllabus Breakdown (Months, Themes, Grammar Focus).
- **REQ-2.4:** Lesson View:
  - Display Lesson Plan Template (Topic, Learning Outcome, Instructional Flow).
  - List Teaching Aids & Resources.

## 3. Data Infrastructure
- **REQ-3.1:** Extend Firestore/MongoDB schema to support `Course`, `Module`, and `Lesson` entities.
- **REQ-3.2:** Implement robust API endpoints for hierarchical data fetching.
- **REQ-3.3:** Create a seeding script to inject structured curriculum data from the PDF framework.

## 4. UI/UX Standards
- **REQ-4.1:** Maintain the dark-themed, "void-black" and "plasma-violet" color palette.
- **REQ-4.2:** Use Lucide icons consistently for educational metaphors (Book, Target, Activity).
- **REQ-4.3:** Ensure responsive layouts for desktop and mobile navigation.