import express from "express";
import {
  getProjectStatistics,
  getTaskStatistics,
  getOutputStatistics,
  getTimelineData,
  getBudgetStatistics,
  getOrganizationNetwork,
} from "../services/statistics.js";

const router = express.Router();

// 获取项目统计信息
router.get("/projects", async (req, res) => {
  try {
    const statistics = await getProjectStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取任务统计信息
router.get("/tasks", async (req, res) => {
  try {
    const statistics = await getTaskStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取成果统计信息
router.get("/outputs", async (req, res) => {
  try {
    const statistics = await getOutputStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取时间线数据
router.get("/timeline", async (req, res) => {
  try {
    const data = await getTimelineData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取经费统计信息
router.get("/budget", async (req, res) => {
  try {
    const statistics = await getBudgetStatistics();
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取组织协作网络数据
router.get("/organizations", async (req, res) => {
  try {
    const network = await getOrganizationNetwork();
    res.json(network);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
