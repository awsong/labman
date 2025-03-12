import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple in-memory data store
const db = {
  users: [
    {
      id: 1,
      username: "admin",
      password: "password",
      name: "Administrator",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
  ],
  projects: [],
  milestones: [],
  progress: [],
  gantt: [],
};

// Configure file storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes

// Authentication
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = db.users.find((u) => u.username === username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // In a real app, you would use bcrypt to compare hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token: "demo-token-" + Date.now(), // In a real app, use JWT
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/user", (req, res) => {
  // In a real app, you would verify the JWT token
  try {
    const user = db.users.find((u) => u.username === "admin");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects
app.get("/api/projects", (req, res) => {
  try {
    // Sort by startDate descending
    const projects = [...db.projects].sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:id", (req, res) => {
  try {
    const project = db.projects.find((p) => p.id === parseInt(req.params.id));

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects", (req, res) => {
  try {
    const {
      name,
      type,
      organization,
      leader,
      contact,
      teamAllocation,
      collaborators,
      startDate,
      endDate,
      summary,
      kpis,
      budget,
    } = req.body;

    const newProject = {
      id:
        db.projects.length > 0
          ? Math.max(...db.projects.map((p) => p.id)) + 1
          : 1,
      name,
      type,
      organization,
      leader,
      contact: contact || null,
      teamAllocation: teamAllocation || null,
      collaborators: collaborators || null,
      startDate,
      endDate,
      summary: summary || null,
      kpis: kpis || null,
      budget: budget || null,
      taskDocument: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.projects.push(newProject);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Memory server running on port ${PORT}`);
});

// Check if running with --init-only flag
if (process.argv.includes("--init-only")) {
  console.log("Memory database initialized. Exiting...");
  process.exit(0);
}
