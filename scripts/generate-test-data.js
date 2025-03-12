import { promises as fs } from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to database file
const dbPath = path.join(__dirname, "..", "backend", "labman.db");

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
    process.exit(1);
  }
  console.log("Connected to the LabMan database.");
});

// Promisify database methods
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Sample data for generating test records
const projectTypes = [
  "国家级项目",
  "省部级项目",
  "市级项目",
  "企业合作项目",
  "横向课题",
  "院校内部项目",
];

const organizations = [
  "中国科学院",
  "北京大学",
  "清华大学",
  "浙江大学",
  "上海交通大学",
  "复旦大学",
  "中国航天科技集团",
  "华为技术有限公司",
  "中国电子科技集团",
  "阿里巴巴集团",
  "腾讯科技",
  "百度公司",
];

const leaders = [
  "张伟",
  "李强",
  "王芳",
  "刘洋",
  "陈静",
  "杨勇",
  "赵敏",
  "周涛",
  "吴秀英",
  "孙磊",
  "朱霞",
  "胡明",
  "郭丽",
  "何强",
  "马超",
  "林冰",
  "高峰",
  "罗杰",
  "梁静",
  "钱伟",
  "谢军",
  "宋敏",
  "韩雪",
  "唐华",
  "许军",
  "邓丽",
  "彭勇",
  "萧敏",
  "蒋伟",
  "侯静",
];

const milestoneTypes = [
  "年度评审",
  "中期评审",
  "结项评审",
  "项目启动",
  "阶段汇报",
];

const milestoneStatuses = ["未开始", "进行中", "已完成", "已延期"];

// Helper function to get random element from array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random date between two dates
const getRandomDate = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const randomDate = new Date(
    startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime())
  );
  return randomDate.toISOString().split("T")[0];
};

// Helper function to get random integer between min and max (inclusive)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a project
const generateProject = (index) => {
  const startYear = getRandomInt(2020, 2023);
  const startDate = getRandomDate(`${startYear}-01-01`, `${startYear}-06-30`);
  const durationYears = getRandomInt(1, 3);
  const endDate = getRandomDate(
    `${startYear + durationYears - 1}-07-01`,
    `${startYear + durationYears}-12-31`
  );

  return {
    name: `${getRandomElement(projectTypes).substring(0, 2)}${index
      .toString()
      .padStart(3, "0")}-${getRandomElement([
      "研发",
      "创新",
      "探索",
      "突破",
      "先进",
    ])}${getRandomElement(["技术", "系统", "方法", "理论", "应用"])}研究`,
    type: getRandomElement(projectTypes),
    organization: getRandomElement(organizations),
    leader: getRandomElement(leaders),
    contact: getRandomElement(leaders),
    teamAllocation: `项目负责人: ${getRandomElement(
      leaders
    )}\n技术负责人: ${getRandomElement(leaders)}\n研究成员: ${getRandomElement(
      leaders
    )}, ${getRandomElement(leaders)}, ${getRandomElement(leaders)}`,
    collaborators:
      Math.random() > 0.3
        ? `${getRandomElement(organizations)}, ${getRandomElement(
            organizations
          )}`
        : "",
    startDate,
    endDate,
    summary: `本项目旨在研究${getRandomElement([
      "人工智能",
      "大数据",
      "区块链",
      "物联网",
      "云计算",
      "5G通信",
      "新能源",
      "新材料",
      "生物医药",
      "量子计算",
    ])}${getRandomElement([
      "应用",
      "技术",
      "理论",
      "系统",
      "方法",
    ])}，解决${getRandomElement([
      "行业痛点",
      "技术难题",
      "理论突破",
      "应用场景",
      "性能提升",
    ])}问题。`,
    kpis: `1. 发表高水平论文${getRandomInt(1, 5)}篇\n2. 申请专利${getRandomInt(
      1,
      3
    )}项\n3. 开发原型系统${getRandomInt(1, 2)}个\n4. 形成技术报告${getRandomInt(
      1,
      3
    )}份`,
    budget: getRandomInt(10, 500) * 10000,
    taskDocument: null,
  };
};

// Generate a milestone for a project
const generateMilestone = (projectId, projectStartDate, projectEndDate) => {
  const startDate = new Date(projectStartDate);
  const endDate = new Date(projectEndDate);
  const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

  // Calculate a random date within the project duration
  const daysOffset = Math.floor(Math.random() * totalDays);
  const milestoneDate = new Date(startDate);
  milestoneDate.setDate(milestoneDate.getDate() + daysOffset);
  const dueDate = milestoneDate.toISOString().split("T")[0];

  // Determine status based on current date and due date
  let status;
  const currentDate = new Date();
  if (milestoneDate < currentDate) {
    status = Math.random() > 0.2 ? "已完成" : "已延期";
  } else {
    status = Math.random() > 0.7 ? "进行中" : "未开始";
  }

  // Calculate completion based on status
  let completion = 0;
  if (status === "已完成") {
    completion = 100;
  } else if (status === "已延期") {
    completion = getRandomInt(50, 90);
  } else if (status === "进行中") {
    completion = getRandomInt(10, 80);
  }

  const type = getRandomElement(milestoneTypes);
  const descriptions = {
    年度评审:
      "完成年度工作总结和下一年度计划制定，准备年度评审材料并通过专家评审。",
    中期评审: "汇报项目进展情况，解决中期遇到的技术难题，调整后续研究方向。",
    结项评审: "完成项目最终验收材料准备，整理研究成果，通过结项验收。",
    项目启动: "制定项目实施方案，组建研究团队，明确各成员分工。",
    阶段汇报: "总结阶段性研究进展，分析存在的问题，规划下一阶段工作。",
  };

  return {
    projectId,
    title: `${type}-${dueDate.substring(0, 7)}`,
    description: descriptions[type],
    type,
    dueDate,
    status,
    completion,
    notes: status === "已延期" ? "因特殊原因延期，已申请延期审批。" : "",
  };
};

// Generate a progress record for a project
const generateProgress = (projectId) => {
  const kpiNames = [
    "发表学术论文",
    "申请发明专利",
    "开发软件系统",
    "培养研究生",
    "建立实验平台",
    "产品原型开发",
    "技术转化",
    "标准制定",
    "研究报告",
  ];

  const kpiName = getRandomElement(kpiNames);
  const targets = {
    发表学术论文: `${getRandomInt(2, 8)}篇`,
    申请发明专利: `${getRandomInt(1, 5)}项`,
    开发软件系统: `${getRandomInt(1, 3)}个`,
    培养研究生: `${getRandomInt(2, 6)}名`,
    建立实验平台: "1个",
    产品原型开发: `${getRandomInt(1, 3)}个`,
    技术转化: `${getRandomInt(1, 3)}项`,
    标准制定: `${getRandomInt(1, 2)}项`,
    研究报告: `${getRandomInt(1, 5)}份`,
  };

  const target = targets[kpiName];
  const targetNumber = parseInt(target);
  const currentNumber = getRandomInt(0, targetNumber);
  const current = `${currentNumber}${target.replace(/[0-9]/g, "")}`;

  let status;
  let completion;

  if (currentNumber === 0) {
    status = "未开始";
    completion = 0;
  } else if (currentNumber < targetNumber) {
    status = "进行中";
    completion = Math.round((currentNumber / targetNumber) * 100);
  } else {
    status = "已完成";
    completion = 100;
  }

  return {
    projectId,
    kpiId: `KPI-${getRandomInt(1, 999).toString().padStart(3, "0")}`,
    kpiName,
    target,
    current,
    status,
    completion,
    notes: "",
  };
};

// Main function to generate test data
const generateTestData = async () => {
  try {
    console.log("Starting test data generation...");

    // Generate projects
    const projectCount = 60;
    console.log(`Generating ${projectCount} projects...`);

    for (let i = 1; i <= projectCount; i++) {
      const project = generateProject(i);
      const result = await run(
        `INSERT INTO projects (name, type, organization, leader, contact, teamAllocation, collaborators, startDate, endDate, summary, kpis, budget, taskDocument)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.name,
          project.type,
          project.organization,
          project.leader,
          project.contact,
          project.teamAllocation,
          project.collaborators,
          project.startDate,
          project.endDate,
          project.summary,
          project.kpis,
          project.budget,
          project.taskDocument,
        ]
      );

      const projectId = result.lastID;

      // Generate 2-5 milestones for each project
      const milestoneCount = getRandomInt(2, 5);
      for (let j = 0; j < milestoneCount; j++) {
        const milestone = generateMilestone(
          projectId,
          project.startDate,
          project.endDate
        );
        await run(
          `INSERT INTO milestones (projectId, title, description, type, dueDate, status, completion, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            milestone.projectId,
            milestone.title,
            milestone.description,
            milestone.type,
            milestone.dueDate,
            milestone.status,
            milestone.completion,
            milestone.notes,
          ]
        );
      }

      // Generate 3-6 progress records for each project
      const progressCount = getRandomInt(3, 6);
      for (let k = 0; k < progressCount; k++) {
        const progress = generateProgress(projectId);
        await run(
          `INSERT INTO progress (projectId, kpiId, kpiName, target, current, status, completion, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            progress.projectId,
            progress.kpiId,
            progress.kpiName,
            progress.target,
            progress.current,
            progress.status,
            progress.completion,
            progress.notes,
          ]
        );
      }

      if (i % 10 === 0) {
        console.log(
          `Generated ${i} projects with their milestones and progress records.`
        );
      }
    }

    console.log("Test data generation completed successfully!");

    // Get counts to verify
    const projectCountResult = await all(
      "SELECT COUNT(*) as count FROM projects"
    );
    const milestoneCountResult = await all(
      "SELECT COUNT(*) as count FROM milestones"
    );
    const progressCountResult = await all(
      "SELECT COUNT(*) as count FROM progress"
    );

    console.log(`Generated data summary:`);
    console.log(`- Projects: ${projectCountResult[0].count}`);
    console.log(`- Milestones: ${milestoneCountResult[0].count}`);
    console.log(`- Progress records: ${progressCountResult[0].count}`);
  } catch (error) {
    console.error("Error generating test data:", error);
  } finally {
    db.close((err) => {
      if (err) {
        console.error("Error closing database connection:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
};

// Run the function
generateTestData();
