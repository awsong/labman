import axios from "axios";
import { useAuthStore } from "@/store/auth";

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "", // 从环境变量获取API基础URL
  timeout: 15000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers["Authorization"] = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    const { response } = error;
    if (response) {
      // 处理401未授权错误
      if (response.status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
        window.location.href = "/login";
      }
      return Promise.reject(response.data);
    }
    return Promise.reject(error);
  }
);

// 封装请求方法
export const request = async (config) => {
  try {
    const response = await service(config);
    return response;
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
};

export default service;
