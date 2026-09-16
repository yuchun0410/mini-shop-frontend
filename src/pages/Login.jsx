import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------
// 登入頁
// ---------------------------------------------
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data || "登入失敗，帳號或密碼錯誤");
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: "40px auto" }}>
      <h2>登入</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input placeholder="帳號" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <input type="password" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p style={{ color: "red" }}>{String(error)}</p>}
        <button type="submit">登入</button>
      </form>
      <p>還沒有帳號？<Link to="/register">去註冊</Link></p>
    </div>
  );
}
