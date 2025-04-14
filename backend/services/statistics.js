import db from "../db/connection.js";

export const getProjectStatistics = async () => {
  try {
    // 获取项目状态分布
    const statusDistribution = db
      .prepare(
        `
      SELECT 
        COUNT(CASE WHEN status = '进行中' THEN 1 END) as ongoing,
        COUNT(CASE WHEN status = '已完成' THEN 1 END) as completed,
        COUNT(CASE WHEN status = '已延期' THEN 1 END) as delayed,
        COUNT(CASE WHEN status = '未开始' THEN 1 END) as pending
      FROM projects
    `
      )
      .get();

    // 获取项目类型分布
    const typeDistribution = db
      .prepare(
        `
      SELECT type, COUNT(*) as count
      FROM projects
      GROUP BY type
    `
      )
      .all()
      .reduce((acc, curr) => {
        acc[curr.type] = curr.count;
        return acc;
      }, {});

    // 获取活跃项目数量及趋势
    const activeProjects = db
      .prepare(
        `
      SELECT COUNT(*) as count
      FROM projects
      WHERE status = '进行中'
    `
      )
      .get().count;

    // 获取上月活跃项目数量计算趋势
    const lastMonthActive = db
      .prepare(
        `
      SELECT COUNT(*) as count
      FROM projects
      WHERE status = '进行中'
      AND startDate <= date('now', '-1 month')
    `
      )
      .get().count;

    const activeProjectsTrend = lastMonthActive
      ? Math.round(((activeProjects - lastMonthActive) / lastMonthActive) * 100)
      : 0;

    return {
      statusDistribution,
      typeDistribution,
      activeProjects,
      activeProjectsTrend,
    };
  } catch (error) {
    throw new Error(`Error getting project statistics: ${error.message}`);
  }
};

export const getTaskStatistics = async () => {
  try {
    // 获取最近12个月的任务完成情况
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // 格式：YYYY-MM
    }).reverse();

    const taskData = months.map((month) => {
      // 计划完成的任务
      const planned = db
        .prepare(
          `
        SELECT COUNT(*) as count
        FROM tasks
        WHERE strftime('%Y-%m', endDate) = ?
      `
        )
        .get(month).count;

      // 实际完成的任务
      const actual = db
        .prepare(
          `
        SELECT COUNT(*) as count
        FROM tasks
        WHERE strftime('%Y-%m', updatedAt) = ?
        AND status = '已完成'
      `
        )
        .get(month).count;

      return { month, planned, actual };
    });

    return {
      timeline: taskData.map((d) => d.month),
      planned: taskData.map((d) => d.planned),
      actual: taskData.map((d) => d.actual),
    };
  } catch (error) {
    throw new Error(`Error getting task statistics: ${error.message}`);
  }
};

export const getOutputStatistics = async () => {
  try {
    const outputTypes = ["论文", "专利", "软件著作权", "技术报告", "标准规范"];
    const outputData = outputTypes.map((type) => {
      // 已完成的成果
      const completed = db
        .prepare(
          `
        SELECT COUNT(*) as count
        FROM tasks
        WHERE type = ?
        AND status = '已完成'
      `
        )
        .get(type).count;

      // 进行中的成果
      const ongoing = db
        .prepare(
          `
        SELECT COUNT(*) as count
        FROM tasks
        WHERE type = ?
        AND status = '进行中'
      `
        )
        .get(type).count;

      // 计划中的成果
      const planned = db
        .prepare(
          `
        SELECT COUNT(*) as count
        FROM tasks
        WHERE type = ?
        AND status = '未开始'
      `
        )
        .get(type).count;

      return { type, completed, ongoing, planned };
    });

    return {
      types: outputTypes,
      completed: outputData.map((d) => d.completed),
      ongoing: outputData.map((d) => d.ongoing),
      planned: outputData.map((d) => d.planned),
    };
  } catch (error) {
    throw new Error(`Error getting output statistics: ${error.message}`);
  }
};

export const getTimelineData = async () => {
  try {
    // 获取最近的10个项目
    const projects = db
      .prepare(
        `
      SELECT name, startDate, endDate
      FROM projects
      ORDER BY startDate DESC
      LIMIT 10
    `
      )
      .all();

    // 为每个项目生成关键时间点
    const projectData = projects.map((project) => {
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const duration = endDate.getTime() - startDate.getTime();
      const midDate = new Date(startDate.getTime() + duration / 2);

      return {
        name: project.name,
        startPoint: [startDate.toISOString(), project.name],
        midPoint: [midDate.toISOString(), project.name],
        endPoint: [endDate.toISOString(), project.name],
      };
    });

    return {
      projects: projectData.map((p) => p.name),
      startPoints: projectData.map((p) => p.startPoint),
      midPoints: projectData.map((p) => p.midPoint),
      endPoints: projectData.map((p) => p.endPoint),
    };
  } catch (error) {
    throw new Error(`Error getting timeline data: ${error.message}`);
  }
};

export const getBudgetStatistics = async () => {
  try {
    // 获取最近12个月的经费使用情况
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7); // 格式：YYYY-MM
    }).reverse();

    const budgetData = months.map((month) => {
      // 计划使用的经费
      const planned = db
        .prepare(
          `
        SELECT COALESCE(SUM(allocation), 0) as total
        FROM project_organizations
        WHERE strftime('%Y-%m', createdAt) = ?
      `
        )
        .get(month).total;

      // 实际使用的经费
      const actual = db
        .prepare(
          `
        SELECT COALESCE(SUM(selfFunding), 0) as total
        FROM project_organizations
        WHERE strftime('%Y-%m', createdAt) = ?
      `
        )
        .get(month).total;

      return { month, planned, actual };
    });

    return {
      timeline: months,
      planned: budgetData.map((d) => d.planned / 10000), // 转换为万元
      actual: budgetData.map((d) => d.actual / 10000),
    };
  } catch (error) {
    throw new Error(`Error getting budget statistics: ${error.message}`);
  }
};

export const getOrganizationNetwork = async () => {
  try {
    // 获取所有组织
    const organizations = db
      .prepare("SELECT id, name, type FROM organizations")
      .all();

    // 获取组织间的协作关系
    const collaborations = db
      .prepare(
        `
      SELECT DISTINCT 
        o1.id as source, 
        o2.id as target,
        COUNT(*) as value
      FROM project_organizations po1
      JOIN project_organizations po2 ON po1.projectId = po2.projectId
      JOIN organizations o1 ON po1.organizationId = o1.id
      JOIN organizations o2 ON po2.organizationId = o2.id
      WHERE o1.id < o2.id
      GROUP BY o1.id, o2.id
    `
      )
      .all();

    // 构建节点和链接数据
    const nodes = organizations.map((org) => ({
      id: org.id,
      name: org.name,
      symbolSize: 50,
      category: org.type,
    }));

    const links = collaborations.map((collab) => ({
      source: collab.source,
      target: collab.target,
      value: collab.value,
    }));

    // 获取组织类型作为分类
    const categories = [...new Set(organizations.map((org) => org.type))].map(
      (type) => ({ name: type })
    );

    return {
      nodes,
      links,
      categories,
    };
  } catch (error) {
    throw new Error(`Error getting organization network: ${error.message}`);
  }
};
