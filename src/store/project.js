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
        // 验证项目数据
        if (!projectData.name) {
          throw new Error("项目名称不能为空");
        }
        if (!projectData.type) {
          throw new Error("项目类型不能为空");
        }
        if (!projectData.organizationId) {
          throw new Error("牵头单位不能为空");
        }
        if (!projectData.leader) {
          throw new Error("项目负责人不能为空");
        }
        if (!projectData.contact) {
          throw new Error("联系人不能为空");
        }
        if (!projectData.startDate) {
          throw new Error("开始日期不能为空");
        }
        if (!projectData.endDate) {
          throw new Error("结束日期不能为空");
        }

        // 验证参与单位
        if (
          !projectData.organizations ||
          projectData.organizations.length === 0
        ) {
          throw new Error("请至少添加一个参与单位");
        }

        // 验证牵头单位信息
        const leaderOrg = projectData.organizations.find(
          (org) => org.organizationId === projectData.organizationId
        );
        if (!leaderOrg) {
          throw new Error("牵头单位信息不完整");
        }
        if (!leaderOrg.leader) {
          throw new Error("牵头单位负责人不能为空");
        }
        if (!leaderOrg.contact) {
          throw new Error("牵头单位联系人不能为空");
        }

        // 创建项目
        const response = await api.post("/projects", projectData);

        // 验证响应数据
        if (!response.data || !response.data.id) {
          throw new Error("创建项目失败：服务器返回数据无效");
        }

        // 更新本地状态
        this.projects.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message || "创建项目失败";
        console.error("Error creating project:", error);
        throw error; // 向上传递错误
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
