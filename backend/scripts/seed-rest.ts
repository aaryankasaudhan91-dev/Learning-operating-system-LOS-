import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

const grades = [3, 6, 8, 10, 11, 12];
const subjects = ['Science', 'Mathematics', 'English'];

async function seedRest() {
  console.log('Starting remaining seed process...');

  for (const grade of grades) {
    for (const subject of subjects) {
      const courseId = `c${grade}-${subject.toLowerCase().substring(0, 3)}`;
      
      const course = {
        id: courseId,
        classLevel: `Class ${grade}`,
        subject: subject,
        title: `Class ${grade} ${subject}`,
        description: `Comprehensive ${subject} curriculum for Class ${grade}.`,
        order: grade
      };

      try {
        const response = await fetch(`${API_BASE}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(course)
        });
        if (response.ok) {
          console.log(`Seeded course: ${course.id}`);
        }
      } catch (err) {
        console.error(`Error seeding course ${course.id}:`, err);
      }

      // Add a module
      const moduleId = `m${grade}-${subject.toLowerCase().substring(0, 3)}-t1`;
      const moduleData = {
        id: moduleId,
        courseId: courseId,
        term: "Term 1 (April – August)",
        title: `Foundations of ${subject} (Grade ${grade})`,
        learningObjectives: [
          `Master core ${subject} concepts suitable for Grade ${grade}.`,
          `Develop critical thinking and analytical skills in ${subject}.`,
          `Apply theoretical knowledge to practical scenarios.`
        ],
        order: 1
      };

      try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moduleData)
        });
        if (response.ok) {
          console.log(`Seeded module: ${moduleData.id}`);
        }
      } catch (err) {
        console.error(`Error seeding module ${moduleData.id}:`, err);
      }

      // Add a lesson
      const lessonId = `l${grade}-${subject.toLowerCase().substring(0, 3)}-t1-apr`;
      const lessonData = {
        id: lessonId,
        moduleId: moduleId,
        month: "April",
        theme: "Introduction",
        topic: `Introduction to ${subject}`,
        learningOutcome: `Students will understand the basic premises of ${subject} for their grade level.`,
        instructionalFlow: [
          { step: "Introduction", duration: "10 mins", activity: "Overview of the year's syllabus and expectations." },
          { step: "Main Teaching", duration: "20 mins", activity: `Interactive discussion on core ${subject} principles.` },
          { step: "Student Engagement", duration: "10 mins", activity: "Q&A and small group brainstorming." }
        ],
        resources: ["Textbook", "Digital Presentation", "Worksheets"],
        order: 1
      };

      try {
        const response = await fetch(`${API_BASE}/courses/${courseId}/modules/${moduleId}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lessonData)
        });
        if (response.ok) {
          console.log(`Seeded lesson: ${lessonData.id}`);
        }
      } catch (err) {
        console.error(`Error seeding lesson ${lessonData.id}:`, err);
      }
    }
  }

  console.log('Remaining seed process completed.');
}

seedRest();
