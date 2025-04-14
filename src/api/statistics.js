import { request } from "@/utils/request";

// 获取项目统计数据
export async function getProjectStatistics() {
  const response = await request({
    url: "/api/statistics/projects",
    method: "get",
  });
  return response.data;
}

// 获取任务统计数据
export async function getTaskStatistics() {
  const response = await request({
    url: "/api/statistics/tasks",
    method: "get",
  });
  return response.data;
}

// 获取成果产出统计数据
export async function getOutputStatistics() {
  const response = await request({
    url: "/api/statistics/outputs",
    method: "get",
  });
  return response.data;
}

// 获取时间轴数据
export async function getTimelineData() {
  const response = await request({
    url: "/api/statistics/timeline",
    method: "get",
  });
  return response.data;
}

// 获取经费统计数据
export async function getBudgetStatistics() {
  const response = await request({
    url: "/api/statistics/budget",
    method: "get",
  });
  return response.data;
}

// 获取组织协作网络数据
export async function getOrganizationNetwork() {
  const response = await request({
    url: "/api/statistics/organizations",
    method: "get",
  });
  return response.data;
}
