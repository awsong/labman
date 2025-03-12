import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Try to import better-sqlite3, fall back to sqlite3 if not available
let Database;
let sqlite3Mode = false;

try {
  const betterSqlite3 = await import("better-sqlite3");
  Database = betterSqlite3.default;
  console.log("Using better-sqlite3");
} catch (err) {
  console.log(
    "Failed to load better-sqlite3, falling back to sqlite3:",
    err.message
  );

  try {
    const sqlite3Module = await import("sqlite3");
    const sqlite3 = sqlite3Module.default || sqlite3Module;
    // Create a wrapper around sqlite3 to match better-sqlite3's API
    sqlite3Mode = true;
    Database = function (filename) {
      const db = new sqlite3.Database(filename);

      // Add synchronous exec method (simplified)
      this.exec = function (sql) {
        return new Promise((resolve, reject) => {
          db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      };

      // Add prepare method to match better-sqlite3 API
      this.prepare = function (sql) {
        const stmt = db.prepare(sql);

        return {
          run: function (...params) {
            return new Promise((resolve, reject) => {
              stmt.run(params, function (err) {
                if (err) reject(err);
                else resolve({ lastInsertRowid: this.lastID });
              });
            });
          },
          get: function (...params) {
            return new Promise((resolve, reject) => {
              stmt.get(params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
          },
          all: function (...params) {
            return new Promise((resolve, reject) => {
              stmt.all(params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
              });
            });
          },
        };
      };

      // Add close method
      this.close = function () {
        return new Promise((resolve, reject) => {
          db.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      };

      return this;
    };
  } catch (sqlite3Err) {
    console.error("Failed to load sqlite3 fallback:", sqlite3Err.message);
    console.error(
      "Please install either better-sqlite3 or sqlite3: npm install sqlite3"
    );
    process.exit(1);
  }
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(__dirname, "labman.db");
const db = new Database(dbPath);

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
const HOST = process.env.HOST || "localhost";

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database initialization
async function initializeDatabase() {
  try {
    // Create projects table
    if (sqlite3Mode) {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          organization TEXT NOT NULL,
          leader TEXT NOT NULL,
          contact TEXT,
          teamAllocation TEXT,
          collaborators TEXT,
          startDate TEXT NOT NULL,
          endDate TEXT NOT NULL,
          summary TEXT,
          kpis TEXT,
          budget REAL,
          taskDocument TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          organization TEXT NOT NULL,
          leader TEXT NOT NULL,
          contact TEXT,
          teamAllocation TEXT,
          collaborators TEXT,
          startDate TEXT NOT NULL,
          endDate TEXT NOT NULL,
          summary TEXT,
          kpis TEXT,
          budget REAL,
          taskDocument TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Create milestones table
    if (sqlite3Mode) {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS milestones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          projectId INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          dueDate TEXT NOT NULL,
          status TEXT NOT NULL,
          completion REAL DEFAULT 0,
          notes TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS milestones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          projectId INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL,
          dueDate TEXT NOT NULL,
          status TEXT NOT NULL,
          completion REAL DEFAULT 0,
          notes TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);
    }

    // Create progress table
    if (sqlite3Mode) {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          projectId INTEGER NOT NULL,
          kpiId TEXT NOT NULL,
          kpiName TEXT NOT NULL,
          target TEXT NOT NULL,
          current TEXT,
          status TEXT NOT NULL,
          completion REAL DEFAULT 0,
          notes TEXT,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          projectId INTEGER NOT NULL,
          kpiId TEXT NOT NULL,
          kpiName TEXT NOT NULL,
          target TEXT NOT NULL,
          current TEXT,
          status TEXT NOT NULL,
          completion REAL DEFAULT 0,
          notes TEXT,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);
    }

    // Create gantt table for gantt chart data
    if (sqlite3Mode) {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS gantt (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          projectId INTEGER NOT NULL,
          data TEXT NOT NULL,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS gantt (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          projectId INTEGER NOT NULL,
          data TEXT NOT NULL,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
        )
      `);
    }

    // Create users table for authentication
    if (sqlite3Mode) {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          theme TEXT DEFAULT '',
          darkMode INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } else {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          theme TEXT DEFAULT '',
          darkMode INTEGER DEFAULT 0,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // 确保users表有theme和darkMode字段（SQLite不支持ALTER TABLE ADD COLUMN IF NOT EXISTS）
    // 所以我们需要检查字段是否存在，如果不存在则重新创建表
    let hasThemeField = false;
    let hasDarkModeField = false;

    try {
      // 获取表结构
      const tableInfo = db.prepare("PRAGMA table_info(users)").all();

      // 检查主题相关字段是否存在
      for (const column of tableInfo) {
        if (column.name === "theme") hasThemeField = true;
        if (column.name === "darkMode") hasDarkModeField = true;
      }

      console.log(
        "用户表字段检查 - theme字段:",
        hasThemeField,
        "darkMode字段:",
        hasDarkModeField
      );

      // 如果缺少主题相关字段，则添加这些字段
      if (!hasThemeField) {
        console.log("添加theme字段到users表");
        db.exec("ALTER TABLE users ADD COLUMN theme TEXT DEFAULT ''");
      }

      if (!hasDarkModeField) {
        console.log("添加darkMode字段到users表");
        db.exec("ALTER TABLE users ADD COLUMN darkMode INTEGER DEFAULT 0");
      }
    } catch (error) {
      console.error("检查或更新users表结构时出错:", error);
    }

    // Insert a default admin user if none exists
    let adminExists;

    if (sqlite3Mode) {
      adminExists = await db
        .prepare("SELECT * FROM users WHERE username = 'admin'")
        .get();
    } else {
      adminExists = db
        .prepare("SELECT * FROM users WHERE username = 'admin'")
        .get();
    }

    if (!adminExists) {
      if (sqlite3Mode) {
        await db
          .prepare(
            "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)"
          )
          .run("admin", "password", "Administrator", "admin");
      } else {
        db.prepare(
          "INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)"
        ).run("admin", "password", "Administrator", "admin");
      }
      console.log("Default admin user created");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

// Call database initialization
await initializeDatabase();

// API Routes

// Authentication
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // In a real app, you would use bcrypt to compare hashed passwords
    // For this demo, we're doing a simple comparison
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // 将darkMode从整数转换为布尔值
    userWithoutPassword.darkMode = userWithoutPassword.darkMode === 1;

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
  // For this demo, we'll just return the admin user
  try {
    const user = db
      .prepare(
        "SELECT id, username, name, role, theme, darkMode FROM users WHERE username = ?"
      )
      .get("admin");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 将darkMode从整数转换为布尔值
    user.darkMode = user.darkMode === 1;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加更新用户资料的API端点
app.put("/api/auth/profile", (req, res) => {
  try {
    const { name, userId } = req.body;

    // 在实际应用中，我们会从JWT token中获取用户ID
    // 这里简化处理，允许通过请求体传入userId，或者默认使用admin用户
    const id = userId || 1; // 默认使用ID为1的用户(admin)

    // 更新用户资料
    const result = db
      .prepare("UPDATE users SET name = ? WHERE id = ?")
      .run(name, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "用户不存在或没有变化" });
    }

    // 获取更新后的用户信息
    const updatedUser = db
      .prepare(
        "SELECT id, username, name, role, theme, darkMode FROM users WHERE id = ?"
      )
      .get(id);

    res.json({
      success: true,
      message: "用户资料已更新",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加更新用户主题设置的API端点
app.put("/api/auth/theme-settings", (req, res) => {
  try {
    const { theme, darkMode, userId } = req.body;

    // 在实际应用中，我们会从JWT token中获取用户ID
    // 这里简化处理，允许通过请求体传入userId，或者默认使用admin用户
    const id = userId || 1; // 默认使用ID为1的用户(admin)

    // 将darkMode转换为整数存储
    const darkModeValue = darkMode ? 1 : 0;

    // 更新用户主题设置
    const result = db
      .prepare("UPDATE users SET theme = ?, darkMode = ? WHERE id = ?")
      .run(theme, darkModeValue, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "用户不存在或没有变化" });
    }

    // 获取更新后的用户信息
    const updatedUser = db
      .prepare(
        "SELECT id, username, name, role, theme, darkMode FROM users WHERE id = ?"
      )
      .get(id);

    // 将darkMode从整数转换回布尔值
    updatedUser.darkMode = updatedUser.darkMode === 1;

    res.json({
      success: true,
      message: "主题设置已更新",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加更改密码的API端点
app.put("/api/auth/password", (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    // 检查是否提供了新密码
    if (!newPassword || newPassword.trim() === "") {
      return res.status(400).json({ error: "新密码不能为空" });
    }

    // 在实际应用中，我们会从JWT token中获取用户ID
    // 这里简化处理，允许通过请求体传入userId，或者默认使用admin用户
    const id = userId || 1; // 默认使用ID为1的用户(admin)

    // 验证当前密码
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);

    if (!user) {
      return res.status(404).json({ error: "用户不存在" });
    }

    // 在实际应用中，应该使用bcrypt比较哈希密码
    // 这里为了演示，使用简单比较
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: "当前密码不正确" });
    }

    // 更新密码
    const result = db
      .prepare("UPDATE users SET password = ? WHERE id = ?")
      .run(newPassword, id);

    res.json({
      success: true,
      message: "密码已更新",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects
app.get("/api/projects", (req, res) => {
  try {
    const projects = db
      .prepare("SELECT * FROM projects ORDER BY startDate DESC")
      .all();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:id", (req, res) => {
  try {
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(req.params.id);

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

    const stmt = db.prepare(`
      INSERT INTO projects (
        name, type, organization, leader, contact, teamAllocation, 
        collaborators, startDate, endDate, summary, kpis, budget
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      name,
      type,
      organization,
      leader,
      contact,
      teamAllocation || null,
      collaborators || null,
      startDate,
      endDate,
      summary || null,
      kpis || null,
      budget || null
    );

    // Get the created project
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/projects/:id", (req, res) => {
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

    const stmt = db.prepare(`
      UPDATE projects SET
        name = ?, type = ?, organization = ?, leader = ?, contact = ?,
        teamAllocation = ?, collaborators = ?, startDate = ?, endDate = ?,
        summary = ?, kpis = ?, budget = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      name,
      type,
      organization,
      leader,
      contact,
      teamAllocation || null,
      collaborators || null,
      startDate,
      endDate,
      summary || null,
      kpis || null,
      budget || null,
      req.params.id
    );

    // Get the updated project
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/projects/:id", (req, res) => {
  try {
    // First, check if project exists
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Delete project
    db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload task document
app.post(
  "/api/projects/:id/task-document",
  upload.single("taskDocument"),
  (req, res) => {
    try {
      const projectId = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Update project with task document
      const taskDocumentPath = `/uploads/${file.filename}`;

      db.prepare(
        "UPDATE projects SET taskDocument = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(taskDocumentPath, projectId);

      const project = db
        .prepare("SELECT * FROM projects WHERE id = ?")
        .get(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({
        message: "File uploaded successfully",
        taskDocument: taskDocumentPath,
        project,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Milestones
app.get("/api/milestones", (req, res) => {
  try {
    const milestones = db
      .prepare("SELECT * FROM milestones ORDER BY dueDate ASC")
      .all();
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:projectId/milestones", (req, res) => {
  try {
    const milestones = db
      .prepare(
        "SELECT * FROM milestones WHERE projectId = ? ORDER BY dueDate ASC"
      )
      .all(req.params.projectId);
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/milestones/:id", (req, res) => {
  try {
    const milestone = db
      .prepare("SELECT * FROM milestones WHERE id = ?")
      .get(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/milestones", (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      type,
      dueDate,
      status,
      completion,
      notes,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO milestones (
        projectId, title, description, type, dueDate, status, completion, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      projectId,
      title,
      description || null,
      type,
      dueDate,
      status,
      completion || 0,
      notes || null
    );

    // Get the created milestone
    const milestone = db
      .prepare("SELECT * FROM milestones WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/milestones/:id", (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      type,
      dueDate,
      status,
      completion,
      notes,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE milestones SET
        projectId = ?, title = ?, description = ?, type = ?, dueDate = ?,
        status = ?, completion = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      projectId,
      title,
      description || null,
      type,
      dueDate,
      status,
      completion || 0,
      notes || null,
      req.params.id
    );

    // Get the updated milestone
    const milestone = db
      .prepare("SELECT * FROM milestones WHERE id = ?")
      .get(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json(milestone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/milestones/:id", (req, res) => {
  try {
    // First, check if milestone exists
    const milestone = db
      .prepare("SELECT * FROM milestones WHERE id = ?")
      .get(req.params.id);

    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    // Delete milestone
    db.prepare("DELETE FROM milestones WHERE id = ?").run(req.params.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Progress
app.get("/api/projects/:projectId/progress", (req, res) => {
  try {
    const progress = db
      .prepare("SELECT * FROM progress WHERE projectId = ?")
      .all(req.params.projectId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/progress", (req, res) => {
  try {
    const {
      projectId,
      kpiId,
      kpiName,
      target,
      current,
      status,
      completion,
      notes,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO progress (
        projectId, kpiId, kpiName, target, current, status, completion, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      projectId,
      kpiId,
      kpiName,
      target,
      current || null,
      status,
      completion || 0,
      notes || null
    );

    // Get the created progress item
    const progressItem = db
      .prepare("SELECT * FROM progress WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(progressItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/progress/:id", (req, res) => {
  try {
    const {
      projectId,
      kpiId,
      kpiName,
      target,
      current,
      status,
      completion,
      notes,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE progress SET
        projectId = ?, kpiId = ?, kpiName = ?, target = ?, current = ?,
        status = ?, completion = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      projectId,
      kpiId,
      kpiName,
      target,
      current || null,
      status,
      completion || 0,
      notes || null,
      req.params.id
    );

    // Get the updated progress item
    const progressItem = db
      .prepare("SELECT * FROM progress WHERE id = ?")
      .get(req.params.id);

    if (!progressItem) {
      return res.status(404).json({ error: "Progress item not found" });
    }

    res.json(progressItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gantt Chart Data
app.get("/api/projects/:projectId/gantt", (req, res) => {
  try {
    const ganttData = db
      .prepare("SELECT * FROM gantt WHERE projectId = ?")
      .get(req.params.projectId);

    if (!ganttData) {
      return res.json({ tasks: [] }); // Return empty data if none exists
    }

    // Parse the JSON data stored in the database
    res.json(JSON.parse(ganttData.data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/projects/:projectId/gantt", (req, res) => {
  try {
    const projectId = req.params.projectId;
    const data = JSON.stringify(req.body);

    // Check if data already exists for this project
    const existing = db
      .prepare("SELECT * FROM gantt WHERE projectId = ?")
      .get(projectId);

    if (existing) {
      // Update existing data
      db.prepare(
        "UPDATE gantt SET data = ?, updatedAt = CURRENT_TIMESTAMP WHERE projectId = ?"
      ).run(data, projectId);
    } else {
      // Insert new data
      db.prepare("INSERT INTO gantt (projectId, data) VALUES (?, ?)").run(
        projectId,
        data
      );
    }

    res.json(req.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats and analytics
app.get("/api/statistics", (req, res) => {
  try {
    // Projects by year
    const projectsByYear = db
      .prepare(
        `
      SELECT strftime('%Y', startDate) as year, COUNT(*) as count 
      FROM projects 
      GROUP BY year 
      ORDER BY year
    `
      )
      .all();

    // Projects by type
    const projectsByType = db
      .prepare(
        `
      SELECT type, COUNT(*) as count 
      FROM projects 
      GROUP BY type
    `
      )
      .all();

    // Projects by organization
    const projectsByOrg = db
      .prepare(
        `
      SELECT organization, COUNT(*) as count 
      FROM projects 
      GROUP BY organization
    `
      )
      .all();

    // Overall project stats
    const totalProjects = db
      .prepare("SELECT COUNT(*) as count FROM projects")
      .get().count;
    const activeProjects = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM projects 
      WHERE date('now') BETWEEN date(startDate) AND date(endDate)
    `
      )
      .get().count;

    res.json({
      projectsByYear,
      projectsByType,
      projectsByOrg,
      totalProjects,
      activeProjects,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 在所有API路由之后，提供前端静态文件
// 仅在生产环境中启用
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../dist");
  console.log(`提供静态文件，路径: ${staticPath}`);

  // 使用express.static中间件提供静态文件
  app.use(express.static(staticPath));

  // 所有未匹配的路由返回index.html (处理SPA路由)
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

// Check if running with --init-only flag
if (process.argv.includes("--init-only")) {
  console.log("Database initialized. Exiting...");
  process.exit(0);
}
