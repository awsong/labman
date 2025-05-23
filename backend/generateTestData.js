import db from "./db/connection.js";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目类型列表
const projectTypes = [
  "国家级项目",
  "省部级项目",
  "市级项目",
  "企业合作项目",
  "横向课题",
  "院校内部项目",
];

// 项目名称前缀
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

// 项目名称后缀
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

// 姓氏列表
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

// 名字列表
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

// 职称列表
const titles = [
  "教授",
  "副教授",
  "讲师",
  "研究员",
  "高级工程师",
  "工程师",
  "技术员",
];

// 职务列表
const positions = [
  "院长",
  "副院长",
  "系主任",
  "副主任",
  "项目负责人",
  "研究员",
  "工程师",
];

// 学历列表
const educations = ["博士", "硕士", "学士"];

// 专业列表
const majors = [
  "计算机科学",
  "软件工程",
  "人工智能",
  "信息工程",
  "电子工程",
  "通信工程",
];

// 研究方向列表
const researchAreas = [
  "人工智能",
  "大数据",
  "云计算",
  "物联网",
  "信息安全",
  "智能制造",
];

// 预期成果列表
const expectedOutcomes = [
  {
    type: "论文发表",
    details: [
      "在SCI/EI检索期刊发表论文",
      "在核心期刊发表研究论文",
      "在国际会议发表论文",
      "在国内重要期刊发表论文",
    ],
  },
  {
    type: "专利申请",
    details: [
      "申请发明专利",
      "申请实用新型专利",
      "申请软件著作权",
      "申请外观设计专利",
    ],
  },
  {
    type: "技术报告",
    details: [
      "形成技术研究报告",
      "完成可行性分析报告",
      "编写技术规范文档",
      "撰写项目总结报告",
    ],
  },
  {
    type: "系统开发",
    details: ["开发原型系统", "完成示范应用", "建立实验平台", "部署生产环境"],
  },
];

// 参与人角色和职责
const participantRoles = [
  {
    role: "项目负责人",
    responsibilities: [
      "总体规划与协调",
      "项目进度管理",
      "资源调配",
      "质量控制",
    ],
  },
  {
    role: "技术负责人",
    responsibilities: [
      "技术方案设计",
      "关键技术攻关",
      "技术文档审核",
      "技术团队指导",
    ],
  },
  {
    role: "研究人员",
    responsibilities: [
      "具体研究工作",
      "实验设计与实施",
      "数据分析",
      "撰写研究报告",
    ],
  },
  {
    role: "开发工程师",
    responsibilities: [
      "系统开发实现",
      "代码编写测试",
      "技术文档编写",
      "部署维护支持",
    ],
  },
];

// 专业技能列表
const skills = [
  "Python开发",
  "Java开发",
  "深度学习",
  "数据挖掘",
  "Web开发",
  "数据库设计",
  "系统架构",
  "项目管理",
  "算法设计",
  "网络安全",
];

// 任务类型列表
const taskTypes = [
  "软件",
  "硬件",
  "论文",
  "专利",
  "软件著作权",
  "标准",
  "技术报告",
  "应用规范",
];

// 任务状态列表
const taskStatuses = ["未开始", "进行中", "已完成", "已延期", "待评审"];

// 里程碑名称列表
const milestoneNames = ["立项完成", "中期报告", "年度报告", "项目答辩", "结项"];

// 生成随机中文姓名
const generateChineseName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return firstName + lastName;
};

// 生成测试数据的主函数
export function generateTestData() {
  try {
    // 清除现有数据
    db.prepare("DELETE FROM projects").run();
    db.prepare("DELETE FROM project_organizations").run();
    db.prepare("DELETE FROM milestones").run();
    db.prepare("DELETE FROM progress").run();
    db.prepare("DELETE FROM gantt").run();
    db.prepare("DELETE FROM users WHERE username != 'admin'").run();

    // 获取所有组织
    const organizations = db.prepare("SELECT * FROM organizations").all();

    // 为每个组织创建5-10个测试用户
    const insertUser = db.prepare(`
      INSERT INTO users (
        username, password, name, role,
        idNumber, position, title, education,
        major, researchArea, organizationId,
        skills, responsibilities, projectRole
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

        // 随机选择3-5个技能
        const userSkills = shuffle(skills).slice(
          0,
          3 + Math.floor(Math.random() * 3)
        );

        // 随机选择一个角色及其职责
        const roleInfo =
          participantRoles[Math.floor(Math.random() * participantRoles.length)];

        insertUser.run(
          username,
          "password",
          name,
          roleInfo.role,
          `${Math.floor(Math.random() * 10000000000)}`,
          position,
          title,
          education,
          major,
          researchArea,
          org.id,
          JSON.stringify(userSkills),
          JSON.stringify(roleInfo.responsibilities),
          roleInfo.role
        );
      }
    });

    // 获取所有用户
    const users = db.prepare("SELECT * FROM users").all();

    // 生成200个项目
    const insertProject = db.prepare(`
      INSERT INTO projects (
        name, type, status, startDate, endDate,
        budget, description, expectedOutcomes,
        organizationId, leaderId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertProjectOrg = db.prepare(`
      INSERT INTO project_organizations (
        projectId, organizationId, isLeader, selfFunding, allocation,
        leader, participants, expectedOutcomes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMilestone = db.prepare(`
      INSERT INTO milestones (
        projectId, title, description, dueDate, status, completion
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertProgress = db.prepare(`
      INSERT INTO progress (
        projectId, kpiId, kpiName, target, current, status, completion
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (let i = 1; i <= 200; i++) {
      // 生成2024-2026年间的随机日期
      const startYear = 2024 + Math.floor(Math.random() * 2); // 2024-2025
      const startMonth = 1 + Math.floor(Math.random() * 12);
      const startDate = new Date(startYear, startMonth - 1, 1);

      // 项目持续时间：6-24个月
      const durationMonths = 6 + Math.floor(Math.random() * 19);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // 选择牵头单位
      const leadOrg =
        organizations[Math.floor(Math.random() * organizations.length)];
      const type =
        projectTypes[Math.floor(Math.random() * projectTypes.length)];

      // 从牵头单位的用户中选择负责人
      const leadOrgUsers = users.filter(
        (user) => user.organizationId === leadOrg.id
      );
      const leader =
        leadOrgUsers[Math.floor(Math.random() * leadOrgUsers.length)];

      // 生成项目名称
      const prefix =
        projectPrefixes[Math.floor(Math.random() * projectPrefixes.length)];
      const suffix =
        projectSuffixes[Math.floor(Math.random() * projectSuffixes.length)];
      const projectName = `${prefix}${suffix}`;

      // 随机项目状态
      const projectStatus =
        Math.random() < 0.6
          ? "进行中"
          : Math.random() < 0.8
          ? "已完成"
          : Math.random() < 0.9
          ? "已延期"
          : "未开始";

      // 插入项目
      const result = insertProject.run(
        projectName,
        type,
        projectStatus,
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
        null,
        `这是一个${type}，主要研究${prefix}${suffix}相关内容，包括关键技术突破、应用示范等。`,
        JSON.stringify(expectedOutcomes),
        leadOrg.id,
        leader.id
      );

      const projectId = result.lastInsertRowid;

      // 插入牵头单位及经费
      const leadOrgFunding = 50 + Math.floor(Math.random() * 450);
      const leadOrgAllocation = 100 + Math.floor(Math.random() * 900);

      // 从牵头单位的用户中选择参与人员
      const participants = leadOrgUsers
        .filter((user) => user.id !== leader.id)
        .slice(0, 3)
        .map((user) => user.name);

      const projectExpectedOutcomes = {
        software: Math.floor(Math.random() * 5),
        hardware: Math.floor(Math.random() * 3),
        papers: Math.floor(Math.random() * 10),
        patents: Math.floor(Math.random() * 5),
        copyrights: Math.floor(Math.random() * 5),
        standards: Math.floor(Math.random() * 2),
        reports: Math.floor(Math.random() * 5),
        demonstrations: Math.floor(Math.random() * 3),
      };

      insertProjectOrg.run(
        projectId,
        leadOrg.id,
        1,
        leadOrgFunding,
        leadOrgAllocation,
        leader.name,
        JSON.stringify(participants),
        JSON.stringify(projectExpectedOutcomes)
      );

      // 添加1-3个参与单位
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

        // 获取参与单位的用户
        const orgUsers = users.filter((user) => user.organizationId === org.id);

        // 为参与单位选择负责人
        const orgLeader = orgUsers[Math.floor(Math.random() * orgUsers.length)];

        // 选择参与人员
        const orgParticipants = orgUsers
          .filter((user) => user.id !== orgLeader.id)
          .slice(0, 3)
          .map((user) => user.name);

        const orgExpectedOutcomes = {
          software: Math.floor(Math.random() * 3),
          hardware: Math.floor(Math.random() * 2),
          papers: Math.floor(Math.random() * 5),
          patents: Math.floor(Math.random() * 3),
          copyrights: Math.floor(Math.random() * 3),
          standards: Math.floor(Math.random() * 1),
          reports: Math.floor(Math.random() * 3),
          demonstrations: Math.floor(Math.random() * 2),
        };

        insertProjectOrg.run(
          projectId,
          org.id,
          0,
          selfFunding,
          allocation,
          orgLeader.name,
          JSON.stringify(orgParticipants),
          JSON.stringify(orgExpectedOutcomes)
        );
      }

      // 为每个项目添加3-5个里程碑
      const milestoneCount = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < milestoneCount; j++) {
        const milestoneDate = new Date(startDate);
        milestoneDate.setMonth(
          milestoneDate.getMonth() +
            Math.floor(((j + 1) * durationMonths) / (milestoneCount + 1))
        );

        // 从里程碑名称列表中选择一个名称
        const milestoneName = milestoneNames[j % milestoneNames.length];

        // 根据日期确定里程碑状态
        const now = new Date();
        let milestoneStatus;
        let completion;

        if (milestoneDate < now) {
          milestoneStatus = Math.random() < 0.8 ? "已完成" : "已延期";
          completion =
            milestoneStatus === "已完成"
              ? 100
              : 70 + Math.floor(Math.random() * 20);
        } else if (
          milestoneDate.getTime() - now.getTime() >
          30 * 24 * 60 * 60 * 1000
        ) {
          // 超过30天
          milestoneStatus = "未开始";
          completion = 0;
        } else {
          milestoneStatus = "进行中";
          completion = 20 + Math.floor(Math.random() * 60);
        }

        const milestoneResult = insertMilestone.run(
          projectId,
          milestoneName,
          `这是项目的${milestoneName}阶段，需要完成相关研究内容和文档提交。`,
          milestoneDate.toISOString().split("T")[0],
          milestoneStatus,
          completion
        );

        // 为每个里程碑添加2-4个任务
        const taskCount = 2 + Math.floor(Math.random() * 3);
        const insertTask = db.prepare(`
          INSERT INTO tasks (
            milestoneId, name, startDate, endDate, assignee,
            type, status, notes, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        for (let k = 0; k < taskCount; k++) {
          // 计算任务的起止时间，确保在当前日期附近
          const now = new Date();
          const taskStartDate = new Date(now);
          taskStartDate.setDate(
            taskStartDate.getDate() - Math.floor(Math.random() * 60)
          ); // 最近60天内开始
          const taskEndDate = new Date(taskStartDate);
          taskEndDate.setDate(
            taskStartDate.getDate() + 15 + Math.floor(Math.random() * 45)
          ); // 15-60天的持续时间

          // 根据日期确定任务状态
          let taskStatus;
          if (taskEndDate < now) {
            taskStatus = Math.random() < 0.8 ? "已完成" : "已延期";
          } else if (taskStartDate > now) {
            taskStatus = "未开始";
          } else {
            taskStatus = "进行中";
          }

          // 随机选择任务类型和状态
          const taskType =
            taskTypes[Math.floor(Math.random() * taskTypes.length)];

          // 从参与人员中随机选择一个作为任务负责人
          const taskAssignee =
            participants[Math.floor(Math.random() * participants.length)];

          insertTask.run(
            milestoneResult.lastInsertRowid,
            `${taskType}任务${k + 1}`,
            taskStartDate.toISOString().split("T")[0],
            taskEndDate.toISOString().split("T")[0],
            taskAssignee,
            taskType,
            taskStatus,
            `这是${milestoneName}阶段的${taskType}相关任务。`
          );
        }
      }

      // 为每个项目插入3个进度记录
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

    return {
      success: true,
      message: "Successfully generated 200 test projects with related data",
    };
  } catch (error) {
    console.error("Error generating test data:", error);
    throw error;
  }
}

// 辅助函数：随机打乱数组
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 如果直接运行此文件，则执行数据生成
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log("开始生成测试数据...");
  generateTestData();
  console.log("测试数据生成完成！");
  process.exit(0);
}
