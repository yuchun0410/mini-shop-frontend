import { createContext, useContext, useEffect, useState } from "react";
import api, { refreshAccessToken, setAccessToken } from "../api";

// ---------------------------------------------
// 登入狀態管理（AuthContext）
// ---------------------------------------------
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // 一進網站先靠 cookie 裡的 refresh token 換一個 access token，再問後端「我是誰」。
  // access token 只存在記憶體，重新整理頁面就沒了，所以這一步是「恢復登入狀態」的關鍵。
  // 訪客沒有 cookie，換發會失敗，視為沒登入就好。
  useEffect(() => {
    refreshAccessToken()
      .then(() => api.get("/members/me"))
      .then((res) => setMember(res.data))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, []);

  // 登入成功後，後端回傳 { member, accessToken }，refresh token 由後端直接放進 HttpOnly cookie，
  // 前端看不到也不用處理。accessToken 只存在記憶體。
  async function login(username, password) {
    const res = await api.post("/members/login", { username, password });
    const { member, accessToken } = res.data;
    setAccessToken(accessToken);
    setMember(member);
  }

  async function register(username, password, email, name) {
    await api.post("/members/register", { username, password, email, name });
  }

  // 登出：後端會從 cookie 讀 refresh token 並從 Redis 刪掉，同時叫瀏覽器把 cookie 清掉。
  // 前端自己也要清掉記憶體裡的 access token，不然畫面上看起來像登出了，token 其實還在。
  async function logout() {
    try {
      await api.post("/members/logout");
    } catch (e) {
      // 就算後端登出失敗，前端還是要清掉本地狀態
    }
    setAccessToken(null);
    setMember(null);
  }

  return (
    <AuthContext.Provider value={{ member, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}