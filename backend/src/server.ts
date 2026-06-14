import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";

// Models
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: String,
  role: { type: String, enum: ['student', 'mentor'], required: true },
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await CourseModel.find().sort({ order: 1 });
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
