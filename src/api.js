import axios from "axios";

// ---------------------------------------------
// API 設定
// ---------------------------------------------
// 本機開發沒設環境變數，就用 localhost；部署到 Vercel 後會讀 VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// access token 只放在記憶體（這個變數），不存 localStorage：
// 就算網站被注入惡意 script，也沒辦法從 localStorage 偷走 token。
// 代價是重新整理頁面後它會消失，所以 App 啟動時要靠 refresh token（在 HttpOnly cookie 裡）換一個回來。
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  // refresh token 放在 HttpOnly cookie：要讓瀏覽器送出請求時帶上 cookie、
  // 收到 Set-Cookie 時也真的存起來，一定要開這個
  withCredentials: true,
});

// 每個請求自動帶上 Authorization header
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 用 cookie 裡的 refresh token 換一個新的 access token，存進記憶體後回傳
// 這個請求本身不帶任何 token，瀏覽器會自己把 cookie 帶上去
export async function refreshAccessToken() {
  const res = await axios.post(`${API_BASE_URL}/members/refresh`, null, {
    withCredentials: true,
  });
  accessToken = res.data.accessToken;
  return accessToken;
}

// access token 過期（401）時，自動換一組新的再重打一次
let isRefreshing = false;
let pendingQueue = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 記憶體裡沒有 access token，代表使用者本來就沒登入（例如訪客、或登入密碼打錯），
      // 不需要也不應該去換發
      if (!accessToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, originalRequest });
        });
      }

      isRefreshing = true;
      try {
        const newAccessToken = await refreshAccessToken();

        pendingQueue.forEach(({ resolve, originalRequest: req }) => {
          req.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(req));
        });
        pendingQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        pendingQueue.forEach(({ reject }) => reject(refreshError));
        pendingQueue = [];
        accessToken = null;
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