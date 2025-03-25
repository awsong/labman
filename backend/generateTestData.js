import betterSqlite3 from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
const dbPath = path.join(__dirname, "labman.db");
const db = new betterSqlite3(dbPath);

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
        major, researchArea, organizationId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    // 获取所有用户
    const users = db.prepare("SELECT * FROM users").all();

    // 生成200个项目
    const insertProject = db.prepare(`
      INSERT INTO projects (
        name, type, organizationId, leaderId, contactId, teamAllocation,
        collaborators, startDate, endDate, summary, kpis,
        taskDocument
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertProjectOrg = db.prepare(`
      INSERT INTO project_organizations (
        projectId, organizationId, isLeader, selfFunding, allocation,
        leader, contact, participants, expectedOutcomes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      // 生成2020-2025年间的随机日期
      const startYear = 2020 + Math.floor(Math.random() * 3);
      const startMonth = 1 + Math.floor(Math.random() * 12);
      const startDate = new Date(startYear, startMonth - 1, 1);

      // 项目持续时间：1-3年
      const durationMonths = 12 + Math.floor(Math.random() * 24);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // 选择牵头单位
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

      // 生成项目名称
      const prefix =
        projectPrefixes[Math.floor(Math.random() * projectPrefixes.length)];
      const suffix =
        projectSuffixes[Math.floor(Math.random() * projectSuffixes.length)];
      const projectName = `${prefix}${suffix}`;

      // 插入项目
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

      // 插入牵头单位及经费
      const leadOrgFunding = 50 + Math.floor(Math.random() * 450);
      const leadOrgAllocation = 100 + Math.floor(Math.random() * 900);

      // 从牵头单位的用户中选择参与人员
      const participants = leadOrgUsers
        .filter((user) => user.id !== leader.id && user.id !== contact.id)
        .slice(0, 3)
        .map((user) => user.name);

      const expectedOutcomes = {
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
        contact.name,
        JSON.stringify(participants),
        JSON.stringify(expectedOutcomes)
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

        // 为参与单位选择负责人和联系人
        const orgLeader = orgUsers[Math.floor(Math.random() * orgUsers.length)];
        const orgContact =
          orgUsers[Math.floor(Math.random() * orgUsers.length)];

        // 选择参与人员
        const orgParticipants = orgUsers
          .filter(
            (user) => user.id !== orgLeader.id && user.id !== orgContact.id
          )
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
          orgContact.name,
          JSON.stringify(orgParticipants),
          JSON.stringify(orgExpectedOutcomes)
        );
      }

      // 为每个项目插入3-5个里程碑
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
