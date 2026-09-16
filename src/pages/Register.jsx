import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------
// 註冊頁
// ---------------------------------------------
export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(username, password, email, name);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data || "註冊失敗");
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: "40px auto" }}>
      <h2>註冊</h2>
      <form onSubmit={handleSubmit}>
        <div><input placeholder="帳號" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
        <div><input type="password" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <div><input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><input placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} /></div>
        {error && <p style={{ color: "red" }}>{String(error)}</p>}
        {success && <p style={{ color: "green" }}>註冊成功，跳轉登入頁...</p>}
        <button type="submit">註冊</button>
      </form>
      <p>已經有帳號？<Link to="/login">去登入</Link></p>
    </div>
  );
}
