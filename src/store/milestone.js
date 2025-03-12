import { defineStore } from "pinia";
import api from "@/utils/api";

export const useMilestoneStore = defineStore("milestone", {
  state: () => ({
    milestones: [],
    currentMilestone: null,
    loading: false,
    error: null,
  }),

  getters: {
    getMilestoneById: (state) => (id) => {
      return state.milestones.find(
        (milestone) => milestone.id === parseInt(id)
      );
    },

    getMilestonesByProjectId: (state) => (projectId) => {
      return state.milestones.filter(
        (milestone) => milestone.projectId === parseInt(projectId)
      );
    },
  },

  actions: {
    async fetchMilestones(projectId = null) {
      this.loading = true;
      this.error = null;

      try {
        let url = "/milestones";
        if (projectId) {
          url = `/projects/${projectId}/milestones`;
        }

        const response = await api.get(url);
        this.milestones = response.data;
        return this.milestones;
      } catch (error) {
        this.error = error.message || "获取里程碑列表失败";
        console.error("Error fetching milestones:", error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchMilestoneById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/milestones/${id}`);
        this.currentMilestone = response.data;
        return this.currentMilestone;
      } catch (error) {
        this.error = error.message || "获取里程碑详情失败";
        console.error(`Error fetching milestone ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createMilestone(milestoneData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/milestones", milestoneData);
        this.milestones.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || "创建里程碑失败";
        console.error("Error creating milestone:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateMilestone(id, milestoneData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/milestones/${id}`, milestoneData);

        // Update the milestone in the milestones array
        const index = this.milestones.findIndex((m) => m.id === parseInt(id));
        if (index !== -1) {
          this.milestones[index] = response.data;
        }

        // Update currentMilestone if it's the same milestone
        if (
          this.currentMilestone &&
          this.currentMilestone.id === parseInt(id)
        ) {
          this.currentMilestone = response.data;
        }

        return response.data;
      } catch (error) {
        this.error = error.message || "更新里程碑失败";
        console.error(`Error updating milestone ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteMilestone(id) {
      this.loading = true;
      this.error = null;

      try {
        await api.delete(`/milestones/${id}`);

        // Remove the milestone from the milestones array
        this.milestones = this.milestones.filter((m) => m.id !== parseInt(id));

        // Clear currentMilestone if it's the same milestone
        if (
          this.currentMilestone &&
          this.currentMilestone.id === parseInt(id)
        ) {
          this.currentMilestone = null;
        }

        return true;
      } catch (error) {
        this.error = error.message || "删除里程碑失败";
        console.error(`Error deleting milestone ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },
  },
});
