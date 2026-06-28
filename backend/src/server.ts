import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { setupAgentRoutes } from "./agents";

// Models
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ['student', 'mentor'], required: true },
  teacherEmail: String,
  dailyFocusGoal: { type: Number, default: 120 },
  todayFocusMinutes: { type: Number, default: 0 },
  taskCompletionRate: { type: Number, default: 0 },
  peerBadges: { type: Object, default: {} },
  cognitiveLoad: { type: Number, default: 50 },
  lastActive: String,
  badges: [String],
  courses: [String],
}, { strict: false }); // Allow dynamic properties since it's an evolving schema

export const UserProfileModel = mongoose.model('UserProfile', userSchema);

const taskSchema = new mongoose.Schema({
  id: String, // from firestore or generated
  studentId: String,
  title: String,
  status: String,
  difficulty: String,
  estimatedMinutes: Number,
  createdAt: String,
  type: String,
  description: String,
  points: Number
}, { strict: false });

export const TaskModel = mongoose.model('Task', taskSchema);

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  classLevel: String,
  subject: String,
  title: String,
  description: String,
  order: Number
}, { strict: false });
export const CourseModel = mongoose.model('Course', courseSchema);

const moduleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: String,
  term: String,
  title: String,
  learningObjectives: [String],
  order: Number
}, { strict: false });
export const ModuleModel = mongoose.model('Module', moduleSchema);

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  moduleId: String,
  month: String,
  theme: String,
  topic: String,
  learningOutcome: String,
  instructionalFlow: [{
    step: String,
    duration: String,
    activity: String
  }],
  resources: [String],
  order: Number
}, { strict: false });
export const LessonModel = mongoose.model('Lesson', lessonSchema);

const promptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  mentorId: String,
  text: { type: String, required: true },
  cohort: String,
  createdAt: { type: Date, default: Date.now }
});
export const PromptModel = mongoose.model('BroadcastPrompt', promptSchema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Gemini AI Client
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (geminiApiKey) {
    ai = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log("Google Gen AI client initialized.");
  } else {
    console.warn("GEMINI_API_KEY is missing. AI Agent features will fail.");
  }

  // Connect to MongoDB
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI environment variable is missing.");
    // We don't crash unconditionally, to allow UI to guide the user to add it if missing,
    // but without URI, endpoints will fail.
  } else {
    try {
      await mongoose.connect(mongoURI);
      console.log("Connected to MongoDB successfully");
    } catch (err) {
      console.error("Failed to connect to MongoDB", err);
    }
  }

  // --- API Routes ---

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const query: any = {};
      if (req.query.role) query.role = req.query.role;
      if (req.query.email) query.email = req.query.email;
      if (req.query.teacherEmail) query.teacherEmail = req.query.teacherEmail;
      const users = await UserProfileModel.find(query);
      res.json(users);
    } catch (err) {
      console.error("Error in /api/users:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  app.get("/api/users/:uid", async (req, res) => {
    try {
      const user = await UserProfileModel.findOne({ uid: req.params.uid });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (err) {
      console.error("Error in /api/users/:uid:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // --- AI Agent Routes ---
  setupAgentRoutes(app, ai);

  app.post("/api/users/:uid", async (req, res) => {
    try {
      const user = await UserProfileModel.findOneAndUpdate(
        { uid: req.params.uid },
        { ...req.body },
        { new: true, upsert: true }
      );
      res.json(user);
    } catch (err) {
      console.error("Error in POST /api/users/:uid:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Prompts / Broadcasts
  app.post("/api/prompts/broadcast", async (req, res) => {
    try {
      const { text, cohort, mentorId } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Prompt text is required" });
      }
      const newPrompt = new PromptModel({
        id: new mongoose.Types.ObjectId().toString(),
        mentorId: mentorId || "system",
        text,
        cohort: cohort || "All Students"
      });
      await newPrompt.save();
      res.json({ success: true, prompt: newPrompt });
    } catch (err) {
      console.error("Error in POST /api/prompts/broadcast:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/prompts/latest", async (req, res) => {
    try {
      const latestPrompt = await PromptModel.findOne().sort({ createdAt: -1 });
      res.json(latestPrompt || null);
    } catch (err) {
      console.error("Error in GET /api/prompts/latest:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const query: any = {};
      if (req.query.studentId) query.studentId = req.query.studentId;
      
      const tasks = await TaskModel.find(query).sort({ createdAt: -1 });
      
      // Map _id to id if id doesn't exist
      const mappedTasks = tasks.map(t => {
        const obj = t.toObject();
        if (!obj.id) obj.id = obj._id.toString();
        return obj;
      });
      res.json(mappedTasks);
    } catch (err) {
      console.error("Error in /api/tasks:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const newTask = new TaskModel(req.body);
      const savedTask = await newTask.save();
      const obj = savedTask.toObject();
      obj.id = obj._id.toString(); // Ensure we have an id
      
      // Also update the document with its string ID so find queries work seamlessly
      await TaskModel.findByIdAndUpdate(savedTask._id, { id: obj.id });
      
      res.json({ id: obj.id });
    } catch (err) {
      console.error("Error in POST /api/tasks:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      await TaskModel.findOneAndUpdate({ id: req.params.id }, req.body);
      res.json({ success: true });
    } catch (err) {
      console.error("Error in PUT /api/tasks/:id:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await TaskModel.findOneAndDelete({ id: req.params.id });
      res.json({ success: true });
    } catch (err) {
      console.error("Error in DELETE /api/tasks/:id:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/db/telemetry", async (req, res) => {
    try {
      const state = mongoose.connection.readyState;
      const states = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
      const connectionStatus = states[state] || "Unknown";

      let counts = {
        users: 0,
        tasks: 0,
        courses: 0,
        modules: 0,
        lessons: 0
      };

      if (state === 1) {
        counts.users = await UserProfileModel.countDocuments();
        counts.tasks = await TaskModel.countDocuments();
        counts.courses = await CourseModel.countDocuments();
        counts.modules = await ModuleModel.countDocuments();
        counts.lessons = await LessonModel.countDocuments();
      }

      res.json({
        status: connectionStatus,
        uri: process.env.MONGODB_URI ? "mongodb://***" + process.env.MONGODB_URI.substring(process.env.MONGODB_URI.indexOf("@")) : "Not Configured",
        dbName: mongoose.connection.db?.databaseName || "Unknown",
        counts
      });
    } catch (err: any) {
      console.error("Error in GET /api/db/telemetry:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      let courses = await CourseModel.find().sort({ order: 1 });
      
      // Auto-seed dummy course data if the database is empty
      if (courses.length === 0) {
        console.log("No courses found. Seeding dummy data...");
        const defaultCourse = new CourseModel({
          id: "course-demo",
          classLevel: "Class 10",
          subject: "Physics",
          title: "Introduction to Kinematics",
          description: "A foundational course on motion and forces.",
          order: 1
        });
        await defaultCourse.save();
        
        const defaultModule = new ModuleModel({
          id: "mod-demo-1",
          courseId: "course-demo",
          term: "Term 1",
          title: "Mechanics",
          learningObjectives: ["Understand velocity and acceleration", "Apply Newton's Laws"],
          order: 1
        });
        await defaultModule.save();
        
        const defaultLesson = new LessonModel({
          id: "les-demo-1",
          moduleId: "mod-demo-1",
          month: "April",
          theme: "Motion",
          topic: "Velocity vs. Speed",
          learningOutcome: "Distinguish between scalar and vector quantities of motion.",
          instructionalFlow: [
            { step: "Hook", duration: "5 mins", activity: "Show a racecar video." },
            { step: "Direct Instruction", duration: "15 mins", activity: "Explain concepts." },
            { step: "Practice", duration: "15 mins", activity: "Worksheet on velocity calculation." },
            { step: "Closure", duration: "5 mins", activity: "Exit ticket." }
          ],
          resources: ["Video link", "Worksheet PDF"],
          order: 1
        });
        await defaultLesson.save();

        courses = [defaultCourse];
      }
      
      res.json(courses);
    } catch (err) {
      console.error("Error in /api/courses:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const course = await CourseModel.findOneAndUpdate(
        { id: req.body.id },
        { ...req.body },
        { new: true, upsert: true }
      );
      res.json(course);
    } catch (err) {
      console.error("Error in POST /api/courses:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const modules = await ModuleModel.find({ courseId: req.params.courseId }).sort({ order: 1 });
      res.json(modules);
    } catch (err) {
      console.error("Error in /api/courses/:courseId/modules:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/courses/:courseId/modules", async (req, res) => {
    try {
      const module = await ModuleModel.findOneAndUpdate(
        { id: req.body.id },
        { ...req.body, courseId: req.params.courseId },
        { new: true, upsert: true }
      );
      res.json(module);
    } catch (err) {
      console.error("Error in POST /api/courses/:courseId/modules:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/courses/:courseId/modules/:moduleId/lessons", async (req, res) => {
    try {
      const lessons = await LessonModel.find({ moduleId: req.params.moduleId }).sort({ order: 1 });
      res.json(lessons);
    } catch (err) {
      console.error("Error in /api/courses/:courseId/modules/:moduleId/lessons:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/courses/:courseId/modules/:moduleId/lessons", async (req, res) => {
    try {
      const lesson = await LessonModel.findOneAndUpdate(
        { id: req.body.id },
        { ...req.body, moduleId: req.params.moduleId },
        { new: true, upsert: true }
      );
      res.json(lesson);
    } catch (err) {
      console.error("Error in POST /api/courses/:courseId/modules/:moduleId/lessons:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/courses/:courseId/modules/:moduleId/lessons/:lessonId", async (req, res) => {
    try {
      const lesson = await LessonModel.findOne({ id: req.params.lessonId });
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      res.json(lesson);
    } catch (err) {
      console.error("Error in /api/courses/:courseId/modules/:moduleId/lessons/:lessonId:", err);
      res.status(500).json({ error: "Server error" });
    }
  });


  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), '../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
