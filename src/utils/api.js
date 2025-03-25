import axios from "axios";

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Handle 500 Internal Server Error
    if (error.response && error.response.status === 500) {
      console.error("服务器内部错误:", error.response.data);
      return Promise.reject(new Error("服务器内部错误，请稍后再试"));
    }

    // Handle 400 Bad Request
    if (error.response && error.response.status === 400) {
      console.error("请求参数错误:", error.response.data);
      return Promise.reject(
        new Error(error.response.data.error || "请求参数错误")
      );
    }

    // Handle network errors
    if (!error.response) {
      console.error("网络错误:", error);
      return Promise.reject(new Error("网络连接失败，请检查网络设置"));
    }

    // Handle other errors
    console.error("API错误:", error.response.data);
    return Promise.reject(
      new Error(error.response.data.error || "请求失败，请稍后再试")
    );
  }
);

export default api;
