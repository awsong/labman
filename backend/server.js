import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import betterSqlite3 from "better-sqlite3";
import { generateTestData } from "./generateTestData.js";

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

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    taskId INTEGER,
    path TEXT NOT NULL,
    originalName TEXT NOT NULL,
    displayName TEXT NOT NULL,
    size INTEGER NOT NULL,
    uploadTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
  )
`);

// Configure file storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // 使用 Buffer 来正确处理中文文件名
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    // 生成一个唯一的文件名，但保留原始文件名信息
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // 允许的文件类型
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件类型"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制 10MB
  },
});

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
        status TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        budget REAL,
        description TEXT,
        expectedOutcomes TEXT,
        taskDocument TEXT,
        organizationId INTEGER NOT NULL,
        leaderId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizationId) REFERENCES organizations(id),
        FOREIGN KEY (leaderId) REFERENCES users(id)
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
        leader TEXT NOT NULL,
        participants TEXT,
        expectedOutcomes TEXT,
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
        dueDate TEXT NOT NULL,
        status TEXT NOT NULL,
        weight REAL NOT NULL DEFAULT 1.0,
        completion REAL DEFAULT 0,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE
      )
    `);

    // Create tasks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        milestoneId INTEGER NOT NULL,
        name TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        assignee TEXT NOT NULL,
        notes TEXT,
        document TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (milestoneId) REFERENCES milestones (id) ON DELETE CASCADE
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
        researchArea TEXT,                -- 研究方向
        organizationId INTEGER,           -- 单位
        skills TEXT,                      -- 专业技能
        responsibilities TEXT,            -- 职责
        projectRole TEXT,                 -- 项目角色
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
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation,
                'leader', po.leader,
                'participants', po.participants,
                'expectedOutcomes', po.expectedOutcomes
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
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation,
                'leader', po.leader,
                'participants', po.participants,
                'expectedOutcomes', po.expectedOutcomes
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
      status,
      organizationId,
      leader,
      startDate,
      endDate,
      budget,
      description,
      expectedOutcomes,
      organizations, // Array of {organizationId, selfFunding, allocation, leader, participants, expectedOutcomes}
    } = req.body;

    // 根据名字查找用户 ID
    const getUserIdByName = db.prepare(`
      SELECT id FROM users WHERE name = ? AND organizationId = ?
    `);

    const leaderId = getUserIdByName.get(leader, organizationId)?.id;

    if (!leaderId) {
      throw new Error(`找不到负责人: ${leader}`);
    }

    // Insert project
    const insertProject = db.prepare(`
      INSERT INTO projects (
        name, type, status, startDate, endDate,
        budget, description, expectedOutcomes,
        organizationId, leaderId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const projectResult = insertProject.run(
      name,
      type,
      status || "进行中",
      startDate,
      endDate,
      budget || null,
      description || null,
      expectedOutcomes ? JSON.stringify(expectedOutcomes) : null,
      organizationId,
      leaderId
    );

    const projectId = projectResult.lastInsertRowid;

    // Insert project organizations
    const insertProjectOrg = db.prepare(`
      INSERT INTO project_organizations (
        projectId, organizationId, isLeader, selfFunding, allocation,
        leader, participants, expectedOutcomes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert leader organization first
    const leaderOrg = organizations.find(
      (org) => org.organizationId === organizationId
    );
    if (!leaderOrg) {
      throw new Error("找不到牵头单位信息");
    }

    insertProjectOrg.run(
      projectId,
      organizationId,
      1,
      leaderOrg?.selfFunding || 0,
      leaderOrg?.allocation || 0,
      leaderOrg?.leader || leader,
      JSON.stringify(leaderOrg?.participants || []),
      JSON.stringify(
        leaderOrg?.expectedOutcomes || {
          software: 0,
          hardware: 0,
          papers: 0,
          patents: 0,
          copyrights: 0,
          standards: 0,
          reports: 0,
          demonstrations: 0,
        }
      )
    );

    // Insert other organizations
    for (const org of organizations) {
      if (org.organizationId !== organizationId) {
        insertProjectOrg.run(
          projectId,
          org.organizationId,
          0,
          org.selfFunding || 0,
          org.allocation || 0,
          org.leader || "",
          JSON.stringify(org.participants || []),
          JSON.stringify(
            org.expectedOutcomes || {
              software: 0,
              hardware: 0,
              papers: 0,
              patents: 0,
              copyrights: 0,
              standards: 0,
              reports: 0,
              demonstrations: 0,
            }
          )
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
          leader.name as leader,
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation,
                'leader', po.leader,
                'participants', po.participants,
                'expectedOutcomes', po.expectedOutcomes
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
        WHERE p.id = ?
      `
      )
      .get(projectId);

    if (!project) {
      throw new Error("创建项目失败：无法获取项目详情");
    }

    db.exec("COMMIT");
    res.status(201).json(project);
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Error creating project:", error);
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
      status,
      organizationId,
      leaderId,
      startDate,
      endDate,
      budget,
      description,
      expectedOutcomes,
      organizations, // Array of {organizationId, selfFunding, allocation, leader, participants, expectedOutcomes}
    } = req.body;

    // Verify that the leader exists
    const verifyUser = db.prepare(`SELECT id FROM users WHERE id = ?`);
    const leaderExists = verifyUser.get(leaderId);

    if (!leaderExists) {
      throw new Error(`找不到负责人ID: ${leaderId}`);
    }

    // Update project
    const updateProject = db.prepare(`
      UPDATE projects SET
        name = ?, type = ?, status = ?, organizationId = ?, leaderId = ?,
        startDate = ?, endDate = ?, budget = ?, description = ?, expectedOutcomes = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateProject.run(
      name,
      type,
      status || "进行中",
      organizationId,
      leaderId,
      startDate,
      endDate,
      budget || null,
      description || null,
      expectedOutcomes ? JSON.stringify(expectedOutcomes) : null,
      req.params.id
    );

    // Delete existing project organizations
    db.prepare("DELETE FROM project_organizations WHERE projectId = ?").run(
      req.params.id
    );

    // Insert project organizations
    const insertProjectOrg = db.prepare(`
      INSERT INTO project_organizations (
        projectId, organizationId, isLeader, selfFunding, allocation,
        leader, participants, expectedOutcomes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Insert leader organization first
    const leaderOrg = organizations.find(
      (org) => org.organizationId === organizationId
    );
    if (!leaderOrg) {
      throw new Error("找不到牵头单位信息");
    }

    insertProjectOrg.run(
      req.params.id,
      organizationId,
      1,
      leaderOrg?.selfFunding || 0,
      leaderOrg?.allocation || 0,
      leaderOrg?.leader || "",
      JSON.stringify(leaderOrg?.participants || []),
      JSON.stringify(
        leaderOrg?.expectedOutcomes || {
          software: 0,
          hardware: 0,
          papers: 0,
          patents: 0,
          copyrights: 0,
          standards: 0,
          reports: 0,
          demonstrations: 0,
        }
      )
    );

    // Insert other organizations
    for (const org of organizations) {
      if (org.organizationId !== organizationId) {
        insertProjectOrg.run(
          req.params.id,
          org.organizationId,
          0,
          org.selfFunding || 0,
          org.allocation || 0,
          org.leader || "",
          JSON.stringify(org.participants || []),
          JSON.stringify(
            org.expectedOutcomes || {
              software: 0,
              hardware: 0,
              papers: 0,
              patents: 0,
              copyrights: 0,
              standards: 0,
              reports: 0,
              demonstrations: 0,
            }
          )
        );
      }
    }

    // Get the updated project with all details
    const project = db
      .prepare(
        `
        SELECT
          p.*,
          o.name as organization,
          o.type as organizationType,
          leader.name as leader,
          (
            SELECT json_group_array(
              json_object(
                'id', po.id,
                'organizationId', po.organizationId,
                'organizationName', o2.name,
                'organizationType', o2.type,
                'isLeader', po.isLeader,
                'selfFunding', po.selfFunding,
                'allocation', po.allocation,
                'leader', po.leader,
                'participants', po.participants,
                'expectedOutcomes', po.expectedOutcomes
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
        WHERE p.id = ?
      `
      )
      .get(req.params.id);

    if (!project) {
      throw new Error("更新项目失败：无法获取项目详情");
    }

    db.exec("COMMIT");
    res.json(project);
  } catch (error) {
    db.exec("ROLLBACK");
    console.error("Error updating project:", error);
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
      .prepare("SELECT * FROM milestones ORDER BY dueDate DESC")
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
        "SELECT * FROM milestones WHERE projectId = ? ORDER BY dueDate DESC"
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
      dueDate,
      status,
      weight,
      completion,
      notes,
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO milestones (
        projectId, title, description, dueDate, status, weight, completion, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      projectId,
      title,
      description || null,
      dueDate,
      status,
      weight || 1.0,
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
      dueDate,
      status,
      weight,
      completion,
      notes,
    } = req.body;

    const stmt = db.prepare(`
      UPDATE milestones SET
        projectId = ?, title = ?, description = ?, dueDate = ?,
        status = ?, weight = ?, completion = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      projectId,
      title,
      description || null,
      dueDate,
      status,
      weight || 1.0,
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

app.post("/api/organizations", (req, res) => {
  try {
    const { name, type } = req.body;

    // 验证必填字段
    if (!name || !type) {
      return res.status(400).json({ error: "单位名称和类型不能为空" });
    }

    // 检查单位名称是否已存在
    const existingOrg = db
      .prepare("SELECT id FROM organizations WHERE name = ?")
      .get(name);

    if (existingOrg) {
      return res.status(400).json({ error: "单位名称已存在" });
    }

    // 插入新单位
    const result = db
      .prepare("INSERT INTO organizations (name, type) VALUES (?, ?)")
      .run(name, type);

    // 获取新创建的单位信息
    const organization = db
      .prepare("SELECT * FROM organizations WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(organization);
  } catch (error) {
    console.error("Error creating organization:", error);
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
    const result = generateTestData();
    res.json(result);
  } catch (error) {
    console.error("Error generating test data:", error);
    res.status(500).json({ error: error.message });
  }
});

// 获取所有人员列表
app.get("/api/users", (req, res) => {
  try {
    const users = db
      .prepare(
        `SELECT u.*, o.name as organizationName 
         FROM users u 
         LEFT JOIN organizations o ON u.organizationId = o.id 
         ORDER BY u.name`
      )
      .all();
    res.json(users);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

// 检查用户名是否重复
app.get("/api/users/check-username", (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ error: "用户名不能为空" });
    }

    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);

    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error("检查用户名失败:", error);
    res.status(500).json({ error: "检查用户名失败" });
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

// 创建用户
app.post("/api/users", (req, res) => {
  try {
    const {
      name,
      username,
      idNumber,
      organizationId,
      position,
      title,
      education,
      major,
      researchArea,
    } = req.body;

    // 检查用户名是否已存在
    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);
    if (existingUser) {
      return res.status(400).json({ error: "用户名已存在" });
    }

    const result = db
      .prepare(
        `INSERT INTO users (name, username, password, role, idNumber, organizationId, position, title, education, major, researchArea) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        username,
        "password", // 设置默认密码
        "user", // 设置默认角色
        idNumber,
        organizationId,
        position,
        title,
        education,
        major,
        researchArea
      );

    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    console.error("创建用户失败:", error);
    res.status(500).json({ error: "创建用户失败" });
  }
});

// 更新人员信息
app.put("/api/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      idNumber,
      organizationId,
      position,
      title,
      education,
      major,
      researchArea,
    } = req.body;

    db.prepare(
      `UPDATE users 
       SET name = ?, idNumber = ?, organizationId = ?, position = ?, title = ?, education = ?, major = ?, researchArea = ?
       WHERE id = ?`
    ).run(
      name,
      idNumber,
      organizationId,
      position,
      title,
      education,
      major,
      researchArea,
      id
    );

    res.json({ success: true });
  } catch (error) {
    console.error("更新用户失败:", error);
    res.status(500).json({ error: "更新用户失败" });
  }
});

// 删除人员
app.delete("/api/users/:id", (req, res) => {
  try {
    const { id } = req.params;
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (error) {
    console.error("删除用户失败:", error);
    res.status(500).json({ error: "删除用户失败" });
  }
});

// Tasks API
// Get tasks for a milestone
app.get("/api/milestones/:milestoneId/tasks", (req, res) => {
  try {
    const tasks = db
      .prepare(
        `
        SELECT t.*, 
               json_group_array(
                 json_object(
                   'id', d.id,
                   'path', d.path,
                   'originalName', d.originalName,
                   'displayName', d.displayName,
                   'size', d.size,
                   'uploadTime', d.uploadTime
                 )
               ) as documents
        FROM tasks t
        LEFT JOIN documents d ON t.id = d.taskId
        WHERE t.milestoneId = ?
        GROUP BY t.id
        ORDER BY t.startDate
      `
      )
      .all(req.params.milestoneId);

    // Parse documents JSON string for each task
    tasks.forEach((task) => {
      task.documents = JSON.parse(task.documents);
      if (task.documents[0].id === null) {
        task.documents = [];
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error("获取任务列表失败:", error);
    res.status(500).json({ error: "获取任务列表失败" });
  }
});

// Create a new task
app.post("/api/tasks", (req, res) => {
  try {
    const { milestoneId, name, startDate, endDate, assignee, notes } = req.body;

    const result = db
      .prepare(
        `INSERT INTO tasks (milestoneId, name, startDate, endDate, assignee, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(milestoneId, name, startDate, endDate, assignee, notes || null);

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(task);
  } catch (error) {
    console.error("创建任务失败:", error);
    res.status(500).json({ error: "创建任务失败" });
  }
});

// Update a task
app.put("/api/tasks/:id", (req, res) => {
  try {
    const { milestoneId, name, startDate, endDate, assignee, notes } = req.body;

    db.prepare(
      `UPDATE tasks 
       SET milestoneId = ?, name = ?, startDate = ?, endDate = ?, 
           assignee = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(
      milestoneId,
      name,
      startDate,
      endDate,
      assignee,
      notes || null,
      req.params.id
    );

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("更新任务失败:", error);
    res.status(500).json({ error: "更新任务失败" });
  }
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  try {
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);

    // If task has a document, delete it
    if (task.document) {
      const documentPath = path.join(__dirname, "..", task.document);
      if (fs.existsSync(documentPath)) {
        fs.unlinkSync(documentPath);
      }
    }

    res.status(204).send();
  } catch (error) {
    console.error("删除任务失败:", error);
    res.status(500).json({ error: "删除任务失败" });
  }
});

// Upload task document
app.post("/api/tasks/:id/document", upload.single("document"), (req, res) => {
  try {
    const taskId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Update task with document path
    const documentPath = `/uploads/${file.filename}`;

    // 检查任务是否存在
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
    if (!task) {
      // 如果文件已上传，删除它
      if (fs.existsSync(path.join(__dirname, file.path))) {
        fs.unlinkSync(path.join(__dirname, file.path));
      }
      return res.status(404).json({ error: "Task not found" });
    }

    // 如果任务已有文档，删除旧文档
    if (task.document) {
      const oldDocPath = path.join(__dirname, "..", task.document);
      if (fs.existsSync(oldDocPath)) {
        fs.unlinkSync(oldDocPath);
      }
    }

    db.prepare(
      "UPDATE tasks SET document = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(documentPath, taskId);

    const updatedTask = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(taskId);

    res.json({
      message: "File uploaded successfully",
      document: documentPath,
      task: updatedTask,
    });
  } catch (error) {
    console.error("上传文档失败:", error);
    res.status(500).json({ error: error.message || "上传文档失败" });
  }
});

// Get project participants
app.get("/api/projects/:projectId/participants", (req, res) => {
  try {
    const projectOrgs = db
      .prepare(
        `SELECT po.*, o.name as organizationName
         FROM project_organizations po
         JOIN organizations o ON po.organizationId = o.id
         WHERE po.projectId = ?`
      )
      .all(req.params.projectId);

    const participants = [];
    for (const org of projectOrgs) {
      // Add leader and contact
      if (org.leader) {
        participants.push({
          name: org.leader,
          role: "负责人",
          organization: org.organizationName,
        });
      }

      // Add other participants
      if (org.participants) {
        const orgParticipants = JSON.parse(org.participants);
        for (const participant of orgParticipants) {
          participants.push({
            name: participant,
            role: "参与人",
            organization: org.organizationName,
          });
        }
      }
    }

    res.json(participants);
  } catch (error) {
    console.error("获取项目参与人失败:", error);
    res.status(500).json({ error: "获取项目参与人失败" });
  }
});

// Upload temporary document (before task creation)
app.post("/api/tasks/temp-documents", upload.single("document"), (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const documentPath = `/uploads/${file.filename}`;
    // 正确处理中文文件名
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );

    // Save document without taskId (temporary document)
    const result = db
      .prepare(
        `
      INSERT INTO documents (path, originalName, displayName, size)
      VALUES (?, ?, ?, ?)
    `
      )
      .run(documentPath, originalName, originalName, file.size);

    res.json({
      message: "File uploaded successfully",
      documentId: result.lastInsertRowid,
      path: documentPath,
      originalName: originalName,
      displayName: originalName,
    });
  } catch (error) {
    console.error("上传临时文档失败:", error);
    res.status(500).json({ error: error.message || "上传文档失败" });
  }
});

// Associate temporary documents with task
app.post("/api/tasks/:id/associate-documents", (req, res) => {
  try {
    const taskId = req.params.id;
    const { documentIds } = req.body;

    if (!Array.isArray(documentIds)) {
      return res.status(400).json({ error: "Invalid document IDs" });
    }

    // Update documents with taskId
    const stmt = db.prepare("UPDATE documents SET taskId = ? WHERE id = ?");
    for (const docId of documentIds) {
      stmt.run(taskId, docId);
    }

    res.json({ message: "Documents associated successfully" });
  } catch (error) {
    console.error("关联文档失败:", error);
    res.status(500).json({ error: error.message || "关联文档失败" });
  }
});

// Upload document for existing task
app.post("/api/tasks/:id/documents", upload.single("document"), (req, res) => {
  try {
    const taskId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if task exists
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
    if (!task) {
      // Delete uploaded file if task doesn't exist
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ error: "Task not found" });
    }

    const documentPath = `/uploads/${file.filename}`;
    // 正确处理中文文件名
    const originalName = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );

    // Save document with taskId
    const result = db
      .prepare(
        `
      INSERT INTO documents (taskId, path, originalName, displayName, size)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(taskId, documentPath, originalName, originalName, file.size);

    res.json({
      message: "File uploaded successfully",
      documentId: result.lastInsertRowid,
      path: documentPath,
      originalName: originalName,
      displayName: originalName,
    });
  } catch (error) {
    console.error("上传文档失败:", error);
    res.status(500).json({ error: error.message || "上传文档失败" });
  }
});

// Update document name
app.put("/api/tasks/:taskId/documents/:docId", (req, res) => {
  try {
    const { taskId, docId } = req.params;
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: "Display name is required" });
    }

    // Ensure proper encoding of the display name
    const encodedDisplayName = Buffer.from(displayName).toString("utf8");

    db.prepare(
      `
      UPDATE documents 
      SET displayName = ? 
      WHERE id = ? AND taskId = ?
    `
    ).run(encodedDisplayName, docId, taskId);

    const document = db
      .prepare("SELECT * FROM documents WHERE id = ?")
      .get(docId);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Ensure the response also uses proper encoding
    const response = {
      ...document,
      displayName: Buffer.from(document.displayName, "utf8").toString("utf8"),
      originalName: Buffer.from(document.originalName, "utf8").toString("utf8"),
    };

    res.json(response);
  } catch (error) {
    console.error("更新文档名称失败:", error);
    res.status(500).json({ error: error.message || "更新文档名称失败" });
  }
});

// Delete document
app.delete("/api/tasks/:taskId/documents/:docId", (req, res) => {
  try {
    const { taskId, docId } = req.params;

    // Get document info before deletion
    const document = db
      .prepare("SELECT * FROM documents WHERE id = ? AND taskId = ?")
      .get(docId, taskId);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", document.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete document record from database
    db.prepare("DELETE FROM documents WHERE id = ? AND taskId = ?").run(
      docId,
      taskId
    );

    res.status(204).send();
  } catch (error) {
    console.error("删除文档失败:", error);
    res.status(500).json({ error: error.message || "删除文档失败" });
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
