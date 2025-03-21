import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import betterSqlite3 from "better-sqlite3";

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
const db = new betterSqlite3(dbPath);

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
function initializeDatabase() {
  try {
    // Create organizations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default organizations if none exist
    const organizationsExist = db
      .prepare("SELECT COUNT(*) as count FROM organizations")
      .get();
    if (organizationsExist.count === 0) {
      const defaultOrganizations = [
        { name: "计算机科学与技术学院", type: "学院" },
        { name: "软件学院", type: "学院" },
        { name: "人工智能学院", type: "学院" },
        { name: "信息工程学院", type: "学院" },
        { name: "华为技术有限公司", type: "企业" },
        { name: "腾讯科技", type: "企业" },
        { name: "阿里巴巴", type: "企业" },
        { name: "科技部", type: "政府部门" },
        { name: "工信部", type: "政府部门" },
        { name: "教育部", type: "政府部门" },
        { name: "本单位", type: "本单位" },
      ];

      const insertOrg = db.prepare(
        "INSERT INTO organizations (name, type) VALUES (?, ?)"
      );
      for (const org of defaultOrganizations) {
        insertOrg.run(org.name, org.type);
      }
      console.log("Default organizations created");
    }

    // Create projects table with organization reference
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        organizationId INTEGER NOT NULL,
        leaderId INTEGER NOT NULL,
        contactId INTEGER NOT NULL,
        teamAllocation TEXT,
        collaborators TEXT,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        summary TEXT,
        kpis TEXT,
        taskDocument TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES organizations(id),
        FOREIGN KEY (leaderId) REFERENCES users(id),
        FOREIGN KEY (contactId) REFERENCES users(id)
      )
    `);

    // Create project_organizations table for project-organization relationships
    db.exec(`
      CREATE TABLE IF NOT EXISTS project_organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        organizationId INTEGER NOT NULL,
        isLeader BOOLEAN NOT NULL DEFAULT 0,
        selfFunding DECIMAL(10,2) NOT NULL DEFAULT 0,
        allocation DECIMAL(10,2) NOT NULL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (organizationId) REFERENCES organizations (id),
        UNIQUE(projectId, organizationId)
      )
    `);

    // Create milestones table
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

    // Create progress table
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

    // Create gantt table
    db.exec(`
      CREATE TABLE IF NOT EXISTS gantt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        data TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Create users table for authentication
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        idNumber TEXT,                    -- 身份证号
        position TEXT,                    -- 职务
        title TEXT,                       -- 职称
        education TEXT,                   -- 学历
        major TEXT,                       -- 专业
        researchArea TEXT,               -- 研究方向
        organizationId INTEGER,          -- 单位
        theme TEXT DEFAULT '',
        darkMode INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES organizations (id)
      )
    `);

    // Insert a default admin user if none exists
    const adminExists = db
      .prepare("SELECT * FROM users WHERE username = 'admin'")
      .get();

    if (!adminExists) {
      // Get the default organization (本单位)
      const defaultOrg = db
        .prepare("SELECT id FROM organizations WHERE name = '本单位'")
        .get();

      db.prepare(
        `
        INSERT INTO users (
          username, password, name, role, 
          idNumber, position, title, education, 
          major, researchArea, organizationId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      ).run(
        "admin",
        "password",
        "Administrator",
        "admin",
        null,
        "系统管理员",
        null,
        null,
        null,
        null,
        defaultOrg?.id
      );
      console.log("Default admin user created");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Call database initialization
initializeDatabase();

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
      .prepare(
        `
        SELECT 
          p.*,
          o.name as organization,
          o.type as organizationType,
          leader.name as leader,
          contact.name as contact,
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation
              )
            )
            FROM project_organizations po
            JOIN organizations o2 ON po.organizationId = o2.id
            WHERE po.projectId = p.id
          ) as organizations,
          (
            SELECT COALESCE(SUM(selfFunding), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalSelfFunding,
          (
            SELECT COALESCE(SUM(allocation), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalAllocation
        FROM projects p
        JOIN organizations o ON p.organizationId = o.id
        JOIN users leader ON p.leaderId = leader.id
        JOIN users contact ON p.contactId = contact.id
        ORDER BY p.id DESC
      `
      )
      .all();

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:id", (req, res) => {
  try {
    const project = db
      .prepare(
        `
        SELECT 
          p.*,
          o.name as organization,
          o.type as organizationType,
          leader.name as leader,
          contact.name as contact,
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation
              )
            )
            FROM project_organizations po
            JOIN organizations o2 ON po.organizationId = o2.id
            WHERE po.projectId = p.id
          ) as organizations,
          (
            SELECT COALESCE(SUM(selfFunding), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalSelfFunding,
          (
            SELECT COALESCE(SUM(allocation), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalAllocation
        FROM projects p
        JOIN organizations o ON p.organizationId = o.id
        JOIN users leader ON p.leaderId = leader.id
        JOIN users contact ON p.contactId = contact.id
        WHERE p.id = ?
      `
      )
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
  const db = new betterSqlite3(dbPath);
  try {
    db.exec("BEGIN");

    const {
      name,
      type,
      organizationId,
      leader,
      contact,
      teamAllocation,
      collaborators,
      startDate,
      endDate,
      summary,
      kpis,
      organizations, // Array of {organizationId, selfFunding, allocation}
    } = req.body;

    // 根据名字查找用户 ID
    const getUserIdByName = db.prepare(`
      SELECT id FROM users WHERE name = ? AND organizationId = ?
    `);

    const leaderId = getUserIdByName.get(leader, organizationId)?.id;
    const contactId = getUserIdByName.get(contact, organizationId)?.id;

    if (!leaderId || !contactId) {
      throw new Error("项目负责人或联系人不存在");
    }

    // Insert project
    const insertProject = db.prepare(`
      INSERT INTO projects (
        name, type, organizationId, leaderId, contactId, teamAllocation,
        collaborators, startDate, endDate, summary, kpis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const projectResult = insertProject.run(
      name,
      type,
      organizationId,
      leaderId,
      contactId,
      teamAllocation || null,
      collaborators || null,
      startDate,
      endDate,
      summary || null,
      kpis || null
    );

    const projectId = projectResult.lastInsertRowid;

    // Insert project organizations
    const insertProjectOrg = db.prepare(`
      INSERT INTO project_organizations (
        projectId, organizationId, isLeader, selfFunding, allocation
      ) VALUES (?, ?, ?, ?, ?)
    `);

    // Insert leader organization first
    insertProjectOrg.run(
      projectId,
      organizationId,
      1,
      organizations.find((org) => org.organizationId === organizationId)
        ?.selfFunding || 0,
      organizations.find((org) => org.organizationId === organizationId)
        ?.allocation || 0
    );

    // Insert other organizations
    for (const org of organizations) {
      if (org.organizationId !== organizationId) {
        insertProjectOrg.run(
          projectId,
          org.organizationId,
          0,
          org.selfFunding || 0,
          org.allocation || 0
        );
      }
    }

    // Get the created project with all details
    const project = db
      .prepare(
        `
        SELECT 
          p.*,
          o.name as organization,
          o.type as organizationType,
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation
              )
            )
            FROM project_organizations po
            JOIN organizations o2 ON po.organizationId = o2.id
            WHERE po.projectId = p.id
          ) as organizations,
          (
            SELECT COALESCE(SUM(selfFunding), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalSelfFunding,
          (
            SELECT COALESCE(SUM(allocation), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalAllocation
        FROM projects p
        JOIN organizations o ON p.organizationId = o.id
        WHERE p.id = ?
      `
      )
      .get(projectId);

    db.exec("COMMIT");
    res.status(201).json(project);
  } catch (error) {
    db.exec("ROLLBACK");
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/projects/:id", (req, res) => {
  const db = new betterSqlite3(dbPath);
  try {
    db.exec("BEGIN");

    const {
      name,
      type,
      organizationId,
      leader,
      contact,
      teamAllocation,
      collaborators,
      startDate,
      endDate,
      summary,
      kpis,
      organizations, // Array of {organizationId, selfFunding, allocation}
    } = req.body;

    // Update project
    const updateProject = db.prepare(`
      UPDATE projects SET
        name = ?, type = ?, organizationId = ?, leaderId = ?, contactId = ?,
        teamAllocation = ?, collaborators = ?, startDate = ?, endDate = ?,
        summary = ?, kpis = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateProject.run(
      name,
      type,
      organizationId,
      leader,
      contact,
      teamAllocation || null,
      collaborators || null,
      startDate,
      endDate,
      summary || null,
      kpis || null,
      req.params.id
    );

    // Delete existing project organizations
    db.prepare("DELETE FROM project_organizations WHERE projectId = ?").run(
      req.params.id
    );

    // Insert project organizations
    const insertProjectOrg = db.prepare(`
      INSERT INTO project_organizations (
        projectId, organizationId, isLeader, selfFunding, allocation
      ) VALUES (?, ?, ?, ?, ?)
    `);

    // Insert leader organization first
    insertProjectOrg.run(
      req.params.id,
      organizationId,
      1,
      organizations.find((org) => org.organizationId === organizationId)
        ?.selfFunding || 0,
      organizations.find((org) => org.organizationId === organizationId)
        ?.allocation || 0
    );

    // Insert other organizations
    for (const org of organizations) {
      if (org.organizationId !== organizationId) {
        insertProjectOrg.run(
          req.params.id,
          org.organizationId,
          0,
          org.selfFunding || 0,
          org.allocation || 0
        );
      }
    }

    // Get updated project with all details
    const project = db
      .prepare(
        `
        SELECT 
          p.*,
          o.name as organization,
          o.type as organizationType,
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation
              )
            )
            FROM project_organizations po
            JOIN organizations o2 ON po.organizationId = o2.id
            WHERE po.projectId = p.id
          ) as organizations,
          (
            SELECT COALESCE(SUM(selfFunding), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalSelfFunding,
          (
            SELECT COALESCE(SUM(allocation), 0)
            FROM project_organizations
            WHERE projectId = p.id
          ) as totalAllocation
        FROM projects p
        JOIN organizations o ON p.organizationId = o.id
        WHERE p.id = ?
      `
      )
      .get(req.params.id);

    db.exec("COMMIT");
    res.json(project);
  } catch (error) {
    db.exec("ROLLBACK");
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

// Add organizations API endpoints
app.get("/api/organizations", (req, res) => {
  try {
    const organizations = db
      .prepare("SELECT * FROM organizations ORDER BY name")
      .all();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/organizations/:id", (req, res) => {
  try {
    const organization = db
      .prepare("SELECT * FROM organizations WHERE id = ?")
      .get(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization users
app.get("/api/organizations/:id/users", (req, res) => {
  try {
    const users = db
      .prepare(
        `
        SELECT 
          id, name, position, title
        FROM users
        WHERE organizationId = ?
        ORDER BY name
      `
      )
      .all(req.params.id);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate test data endpoint
app.post("/api/generate-test-data", (req, res) => {
  try {
    const projectTypes = [
      "国家级项目",
      "省部级项目",
      "市级项目",
      "企业合作项目",
      "横向课题",
      "院校内部项目",
    ];

    const projectPrefixes = [
      "人工智能",
      "大数据",
      "区块链",
      "物联网",
      "云计算",
      "信息安全",
      "智能制造",
      "数字经济",
      "智慧城市",
      "新能源",
    ];

    const projectSuffixes = [
      "关键技术研究",
      "应用示范",
      "技术创新",
      "平台建设",
      "系统开发",
      "技术攻关",
      "产业化应用",
      "集成创新",
      "示范工程",
      "技术改造",
    ];

    // 更真实的人名列表
    const firstNames = [
      "王",
      "李",
      "张",
      "刘",
      "陈",
      "杨",
      "黄",
      "赵",
      "周",
      "吴",
      "徐",
      "孙",
      "马",
      "朱",
      "胡",
      "郭",
      "何",
      "高",
      "林",
      "郑",
    ];

    const lastNames = [
      "伟",
      "芳",
      "娜",
      "秀英",
      "敏",
      "静",
      "丽",
      "强",
      "磊",
      "洋",
      "艳",
      "勇",
      "军",
      "杰",
      "娟",
      "涛",
      "超",
      "明",
      "霞",
      "平",
      "刚",
      "辉",
      "玲",
      "桂英",
      "丹",
      "萍",
      "鹏",
      "华",
      "健",
      "红",
    ];

    // 生成随机中文姓名
    const generateChineseName = () => {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      return firstName + lastName;
    };

    // Clear existing data
    db.prepare("DELETE FROM projects").run();
    db.prepare("DELETE FROM project_organizations").run();
    db.prepare("DELETE FROM milestones").run();
    db.prepare("DELETE FROM progress").run();
    db.prepare("DELETE FROM gantt").run();
    db.prepare("DELETE FROM users WHERE username != 'admin'").run();

    // Get all organizations
    const organizations = db.prepare("SELECT * FROM organizations").all();

    // 为每个组织创建5-10个测试用户
    const insertUser = db.prepare(`
      INSERT INTO users (
        username, password, name, role, 
        idNumber, position, title, education, 
        major, researchArea, organizationId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const titles = [
      "教授",
      "副教授",
      "讲师",
      "研究员",
      "高级工程师",
      "工程师",
      "技术员",
    ];
    const positions = [
      "院长",
      "副院长",
      "系主任",
      "副主任",
      "项目负责人",
      "研究员",
      "工程师",
    ];
    const educations = ["博士", "硕士", "学士"];
    const majors = [
      "计算机科学",
      "软件工程",
      "人工智能",
      "信息工程",
      "电子工程",
      "通信工程",
    ];
    const researchAreas = [
      "人工智能",
      "大数据",
      "云计算",
      "物联网",
      "信息安全",
      "智能制造",
    ];

    organizations.forEach((org) => {
      const userCount = 5 + Math.floor(Math.random() * 6); // 5-10个用户
      for (let i = 0; i < userCount; i++) {
        const name = generateChineseName();
        const username = `user_${org.id}_${i + 1}`;
        const title = titles[Math.floor(Math.random() * titles.length)];
        const position =
          positions[Math.floor(Math.random() * positions.length)];
        const education =
          educations[Math.floor(Math.random() * educations.length)];
        const major = majors[Math.floor(Math.random() * majors.length)];
        const researchArea =
          researchAreas[Math.floor(Math.random() * researchAreas.length)];

        insertUser.run(
          username,
          "password",
          name,
          "user",
          null,
          position,
          title,
          education,
          major,
          researchArea,
          org.id
        );
      }
    });

    // Get all users
    const users = db.prepare("SELECT * FROM users").all();

    // Generate 200 projects
    const insertProject = db.prepare(`
      INSERT INTO projects (
        name, type, organizationId, leaderId, contactId, teamAllocation,
        collaborators, startDate, endDate, summary, kpis,
        taskDocument
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertProjectOrg = db.prepare(`
      INSERT INTO project_organizations (
        projectId, organizationId, isLeader, selfFunding, allocation
      ) VALUES (?, ?, ?, ?, ?)
    `);

    const insertMilestone = db.prepare(`
      INSERT INTO milestones (
        projectId, title, description, type, dueDate, status, completion
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertProgress = db.prepare(`
      INSERT INTO progress (
        projectId, kpiId, kpiName, target, current, status, completion
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i <= 200; i++) {
      // Generate random dates within 2020-2025
      const startYear = 2020 + Math.floor(Math.random() * 3);
      const startMonth = 1 + Math.floor(Math.random() * 12);
      const startDate = new Date(startYear, startMonth - 1, 1);

      // Project duration: 1-3 years
      const durationMonths = 12 + Math.floor(Math.random() * 24);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // Select lead organization
      const leadOrg =
        organizations[Math.floor(Math.random() * organizations.length)];
      const type =
        projectTypes[Math.floor(Math.random() * projectTypes.length)];

      // 从牵头单位的用户中选择负责人和联系人
      const leadOrgUsers = users.filter(
        (user) => user.organizationId === leadOrg.id
      );
      const leader =
        leadOrgUsers[Math.floor(Math.random() * leadOrgUsers.length)];
      const contact =
        leadOrgUsers[Math.floor(Math.random() * leadOrgUsers.length)];

      // Generate project name
      const prefix =
        projectPrefixes[Math.floor(Math.random() * projectPrefixes.length)];
      const suffix =
        projectSuffixes[Math.floor(Math.random() * projectSuffixes.length)];
      const projectName = `${prefix}${suffix}`;

      // Insert project
      const result = insertProject.run(
        projectName,
        type,
        leadOrg.id,
        leader.id,
        contact.id,
        JSON.stringify({ 研究人员: 3, 技术人员: 2, 管理人员: 1 }),
        JSON.stringify(["合作单位A", "合作单位B"]),
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        `这是一个${type}，主要研究${prefix}${suffix}相关内容，包括关键技术突破、应用示范等。`,
        JSON.stringify([
          { name: "论文发表", target: "3篇" },
          { name: "专利申请", target: "2项" },
          { name: "软件著作权", target: "1项" },
        ]),
        null
      );

      const projectId = result.lastInsertRowid;

      // Insert lead organization with funding
      const leadOrgFunding = 50 + Math.floor(Math.random() * 450);
      const leadOrgAllocation = 100 + Math.floor(Math.random() * 900);
      insertProjectOrg.run(
        projectId,
        leadOrg.id,
        1,
        leadOrgFunding,
        leadOrgAllocation
      );

      // Add 1-3 participating organizations
      const participatingOrgCount = 1 + Math.floor(Math.random() * 3);
      const availableOrgs = organizations.filter(
        (org) => org.id !== leadOrg.id
      );

      for (
        let j = 0;
        j < participatingOrgCount && j < availableOrgs.length;
        j++
      ) {
        const org = availableOrgs[j];
        const selfFunding = 20 + Math.floor(Math.random() * 180);
        const allocation = 50 + Math.floor(Math.random() * 450);
        insertProjectOrg.run(projectId, org.id, 0, selfFunding, allocation);
      }

      // Insert 3-5 milestones for each project
      const milestoneCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < milestoneCount; j++) {
        const milestoneDate = new Date(startDate);
        milestoneDate.setMonth(
          milestoneDate.getMonth() +
            Math.floor((durationMonths * (j + 1)) / (milestoneCount + 1))
        );

        insertMilestone.run(
          projectId,
          `${prefix}${j + 1}阶段性目标`,
          `完成${prefix}相关的第${j + 1}阶段研究内容`,
          ["关键", "普通"][Math.floor(Math.random() * 2)],
          milestoneDate.toISOString().split("T")[0],
          ["未开始", "进行中", "已完成"][Math.floor(Math.random() * 3)],
          Math.floor(Math.random() * 100)
        );
      }

      // Insert 3 progress records for each project
      const kpis = [
        { id: "kpi1", name: "论文发表", target: "3篇" },
        { id: "kpi2", name: "专利申请", target: "2项" },
        { id: "kpi3", name: "软件著作权", target: "1项" },
      ];

      kpis.forEach((kpi) => {
        insertProgress.run(
          projectId,
          kpi.id,
          kpi.name,
          kpi.target,
          Math.floor(Math.random() * 3) + "项",
          ["未开始", "进行中", "已完成"][Math.floor(Math.random() * 3)],
          Math.floor(Math.random() * 100)
        );
      });
    }

    res.json({
      message: "Successfully generated 200 test projects with related data",
    });
  } catch (error) {
    console.error("Error generating test data:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get("/api/users/:id", (req, res) => {
  try {
    const user = db
      .prepare(
        `
        SELECT 
          u.*,
          o.name as organizationName,
          o.type as organizationType
        FROM users u
        LEFT JOIN organizations o ON u.organizationId = o.id
        WHERE u.id = ?
      `
      )
      .get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove sensitive information
    delete user.password;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put("/api/users/:id", (req, res) => {
  try {
    const {
      name,
      idNumber,
      position,
      title,
      education,
      major,
      researchArea,
      organizationId,
      theme,
      darkMode,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE users SET
        name = ?,
        idNumber = ?,
        position = ?,
        title = ?,
        education = ?,
        major = ?,
        researchArea = ?,
        organizationId = ?,
        theme = ?,
        darkMode = ?
      WHERE id = ?
    `);

    stmt.run(
      name,
      idNumber || null,
      position || null,
      title || null,
      education || null,
      major || null,
      researchArea || null,
      organizationId || null,
      theme || "",
      darkMode || 0,
      req.params.id
    );

    // Get updated user data
    const user = db
      .prepare(
        `
        SELECT 
          u.*,
          o.name as organizationName,
          o.type as organizationType
        FROM users u
        LEFT JOIN organizations o ON u.organizationId = o.id
        WHERE u.id = ?
      `
      )
      .get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove sensitive information
    delete user.password;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user password
app.put("/api/users/:id/password", (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const user = db
      .prepare("SELECT password FROM users WHERE id = ?")
      .get(req.params.id);

    if (!user || user.password !== currentPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update password
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
      newPassword,
      req.params.id
    );

    res.json({ message: "Password updated successfully" });
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
