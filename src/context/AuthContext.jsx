import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

// ---------------------------------------------
// 登入狀態管理（AuthContext）
// ---------------------------------------------
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // 一進網站先問後端「現在是不是已經登入了？」，重新整理頁面登入狀態才不會不見
  useEffect(() => {
    api
      .get("/members/me")
      .then((res) => setMember(res.data))
      .catch(() => setMember(null))
      .finally(() => setLoading(false));
  }, []);

  // 登入成功後，後端回傳 { member, accessToken, refreshToken }
  // accessToken / refreshToken 要存起來，之後每次打 API 才帶得出去
  async function login(username, password) {
    const res = await api.post("/members/login", { username, password });
    const { member, accessToken, refreshToken } = res.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setMember(member);
  }

  async function register(username, password, email, name) {
    await api.post("/members/register", { username, password, email, name });
  }

  // 登出要把 refreshToken 一起送給後端，讓後端能真的把它從 Redis 刪掉
  // 前端自己的 token 也要清掉，不然畫面上看起來像登出了，但 token 其實還留著
  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/members/logout", { refreshToken });
    } catch (e) {
      // 就算後端登出失敗，前端還是要清掉本地狀態
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
