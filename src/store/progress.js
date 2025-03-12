import { defineStore } from "pinia";
import api from "@/utils/api";

export const useProgressStore = defineStore("progress", {
  state: () => ({
    progressItems: [],
    ganttData: null,
    loading: false,
    error: null,
  }),

  getters: {
    getProgressByProjectId: (state) => (projectId) => {
      return state.progressItems.filter(
        (item) => item.projectId === parseInt(projectId)
      );
    },

    getGanttDataByProjectId: (state) => (projectId) => {
      if (!state.ganttData) return null;
      return state.ganttData.find(
        (data) => data.projectId === parseInt(projectId)
      );
    },
  },

  actions: {
    async fetchProjectProgress(projectId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/projects/${projectId}/progress`);

        // Store the progress items for this project
        const items = response.data;

        // Filter out any existing items for this project and add the new ones
        this.progressItems = [
          ...this.progressItems.filter(
            (item) => item.projectId !== parseInt(projectId)
          ),
          ...items,
        ];

        return items;
      } catch (error) {
        this.error = error.message || "获取项目进度信息失败";
        console.error(
          `Error fetching progress for project ${projectId}:`,
          error
        );
        return [];
      } finally {
        this.loading = false;
      }
    },

    async updateProgressItem(id, progressData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/progress/${id}`, progressData);

        // Update the progress item in the progressItems array
        const index = this.progressItems.findIndex(
          (item) => item.id === parseInt(id)
        );
        if (index !== -1) {
          this.progressItems[index] = response.data;
        }

        return response.data;
      } catch (error) {
        this.error = error.message || "更新进度信息失败";
        console.error(`Error updating progress item ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async fetchGanttData(projectId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/projects/${projectId}/gantt`);

        // If ganttData is null, initialize it as an array
        if (!this.ganttData) {
          this.ganttData = [];
        }

        // Check if we already have data for this project
        const existingIndex = this.ganttData.findIndex(
          (data) => data.projectId === parseInt(projectId)
        );

        if (existingIndex !== -1) {
          // Update existing data
          this.ganttData[existingIndex] = {
            projectId: parseInt(projectId),
            data: response.data,
          };
        } else {
          // Add new data
          this.ganttData.push({
            projectId: parseInt(projectId),
            data: response.data,
          });
        }

        return response.data;
      } catch (error) {
        this.error = error.message || "获取甘特图数据失败";
        console.error(
          `Error fetching Gantt data for project ${projectId}:`,
          error
        );
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateGanttData(projectId, ganttData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(
          `/projects/${projectId}/gantt`,
          ganttData
        );

        // If ganttData is null, initialize it as an array
        if (!this.ganttData) {
          this.ganttData = [];
        }

        // Check if we already have data for this project
        const existingIndex = this.ganttData.findIndex(
          (data) => data.projectId === parseInt(projectId)
        );

        if (existingIndex !== -1) {
          // Update existing data
          this.ganttData[existingIndex] = {
            projectId: parseInt(projectId),
            data: response.data,
          };
        } else {
          // Add new data
          this.ganttData.push({
            projectId: parseInt(projectId),
            data: response.data,
          });
        }

        return response.data;
      } catch (error) {
        this.error = error.message || "更新甘特图数据失败";
        console.error(
          `Error updating Gantt data for project ${projectId}:`,
          error
        );
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
