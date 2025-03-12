import { defineStore } from "pinia";
import api from "@/utils/api";

export const useProjectStore = defineStore("project", {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  }),

  getters: {
    getProjectById: (state) => (id) => {
      return state.projects.find((project) => project.id === parseInt(id));
    },

    projectsByYear: (state) => {
      const years = {};
      state.projects.forEach((project) => {
        const startYear = new Date(project.startDate).getFullYear();
        if (!years[startYear]) {
          years[startYear] = 0;
        }
        years[startYear]++;
      });
      return years;
    },

    projectsByType: (state) => {
      const types = {};
      state.projects.forEach((project) => {
        if (!types[project.type]) {
          types[project.type] = 0;
        }
        types[project.type]++;
      });
      return types;
    },

    projectsByTeam: (state) => {
      const teams = {};
      state.projects.forEach((project) => {
        if (!teams[project.organization]) {
          teams[project.organization] = 0;
        }
        teams[project.organization]++;
      });
      return teams;
    },
  },

  actions: {
    async fetchProjects() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get("/projects");
        this.projects = response.data;
        return this.projects;
      } catch (error) {
        this.error = error.message || "获取项目列表失败";
        console.error("Error fetching projects:", error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchProjectById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/projects/${id}`);
        this.currentProject = response.data;
        return this.currentProject;
      } catch (error) {
        this.error = error.message || "获取项目详情失败";
        console.error(`Error fetching project ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createProject(projectData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/projects", projectData);
        this.projects.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || "创建项目失败";
        console.error("Error creating project:", error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async updateProject(id, projectData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.put(`/projects/${id}`, projectData);

        // Update the project in the projects array
        const index = this.projects.findIndex((p) => p.id === parseInt(id));
        if (index !== -1) {
          this.projects[index] = response.data;
        }

        // Update currentProject if it's the same project
        if (this.currentProject && this.currentProject.id === parseInt(id)) {
          this.currentProject = response.data;
        }

        return response.data;
      } catch (error) {
        this.error = error.message || "更新项目失败";
        console.error(`Error updating project ${id}:`, error);
        return null;
      } finally {
        this.loading = false;
      }
    },

    async deleteProject(id) {
      this.loading = true;
      this.error = null;

      try {
        await api.delete(`/projects/${id}`);

        // Remove the project from the projects array
        this.projects = this.projects.filter((p) => p.id !== parseInt(id));

        // Clear currentProject if it's the same project
        if (this.currentProject && this.currentProject.id === parseInt(id)) {
          this.currentProject = null;
        }

        return true;
      } catch (error) {
        this.error = error.message || "删除项目失败";
        console.error(`Error deleting project ${id}:`, error);
        return false;
      } finally {
        this.loading = false;
      }
    },

    async uploadTaskDocument(id, formData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(
          `/projects/${id}/task-document`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Update the project in the projects array
        const index = this.projects.findIndex((p) => p.id === parseInt(id));
        if (index !== -1) {
          this.projects[index].taskDocument = response.data.taskDocument;
        }

        // Update currentProject if it's the same project
        if (this.currentProject && this.currentProject.id === parseInt(id)) {
          this.currentProject.taskDocument = response.data.taskDocument;
        }

        return response.data;
      } catch (error) {
        this.error = error.message || "上传任务书失败";
        console.error(
          `Error uploading task document for project ${id}:`,
          error
        );
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});
