import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000/api';

async function seed() {
  const dataPath = path.join(process.cwd(), 'scripts', 'seed-data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const { courses, modules, lessons } = JSON.parse(rawData);

  console.log('Starting seed process...');

  // Seed Courses
  for (const course of courses) {
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      if (response.ok) {
        console.log(`Seeded course: ${course.id}`);
      } else {
        console.error(`Failed to seed course ${course.id}:`, await response.text());
      }
    } catch (err) {
      console.error(`Error seeding course ${course.id}:`, err);
    }
  }

  // Seed Modules
  for (const module of modules) {
    try {
      const response = await fetch(`${API_BASE}/courses/${module.courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(module)
      });
      if (response.ok) {
        console.log(`Seeded module: ${module.id}`);
      } else {
        console.error(`Failed to seed module ${module.id}:`, await response.text());
      }
    } catch (err) {
      console.error(`Error seeding module ${module.id}:`, err);
    }
  }

  // Seed Lessons
  for (const lesson of lessons) {
    try {
      // Find courseId for this module to build the correct path
      const module = modules.find((m: any) => m.id === lesson.moduleId);
      if (!module) continue;

      const response = await fetch(`${API_BASE}/courses/${module.courseId}/modules/${lesson.moduleId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson)
      });
      if (response.ok) {
        console.log(`Seeded lesson: ${lesson.id}`);
      } else {
        console.error(`Failed to seed lesson ${lesson.id}:`, await response.text());
      }
    } catch (err) {
      console.error(`Error seeding lesson ${lesson.id}:`, err);
    }
  }

  console.log('Seed process completed.');
}

seed();
