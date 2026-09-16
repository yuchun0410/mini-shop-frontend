import axios from "axios";

// ---------------------------------------------
// API 設定
// ---------------------------------------------
// 本機開發時沒設環境變數，就用 localhost；部署到 Vercel 後會讀 VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials 不用了：JWT 是用 Authorization header 帶，不是 cookie
});

// 每個請求自動帶上 Authorization header
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// access token 過期（401）時，自動用 refresh token 換一組新的再重打一次
let isRefreshing = false;
let pendingQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/members/refresh`, {
          refreshToken,
        });
        const newAccessToken = res.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        pendingQueue.forEach(({ resolve, originalRequest: req }) => {
          req.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(req));
        });
        pendingQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;