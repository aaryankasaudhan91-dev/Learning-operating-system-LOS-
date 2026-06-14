async function testAPI() {
  const BASE_URL = 'http://localhost:3000';
  
  console.log('--- Testing API Endpoints ---');

  try {
    // 1. GET /api/courses
    const coursesRes = await fetch(`${BASE_URL}/api/courses`);
    if (coursesRes.ok) {
      const courses = await coursesRes.json();
      console.log('✅ GET /api/courses: 200 OK', Array.isArray(courses) ? '(Array)' : '(Object)');
    } else {
      console.error('❌ GET /api/courses:', coursesRes.status);
    }

    // 2. GET /api/courses/test-course/modules
    const modulesRes = await fetch(`${BASE_URL}/api/courses/test-course/modules`);
    if (modulesRes.ok) {
      const modules = await modulesRes.json();
      console.log('✅ GET /api/courses/:courseId/modules: 200 OK', Array.isArray(modules) ? '(Array)' : '(Object)');
    } else {
      console.error('❌ GET /api/courses/:courseId/modules:', modulesRes.status);
    }

    // 3. GET /api/courses/test-course/modules/test-module/lessons
    const lessonsRes = await fetch(`${BASE_URL}/api/courses/test-course/modules/test-module/lessons`);
    if (lessonsRes.ok) {
      const lessons = await lessonsRes.json();
      console.log('✅ GET /api/courses/:courseId/modules/:moduleId/lessons: 200 OK', Array.isArray(lessons) ? '(Array)' : '(Object)');
    } else {
      console.error('❌ GET /api/courses/:courseId/modules/:moduleId/lessons:', lessonsRes.status);
    }

  } catch (error) {
    console.error('❌ Failed to connect to server. Is it running?');
    process.exit(1);
  }
}

testAPI();
