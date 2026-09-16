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
    <div className="container" style={{ maxWidth: 400 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h2 className="card-title mb-4 text-center">登入</h2>

          <div className="alert alert-secondary py-2 small mb-3">
            測試帳號（管理員）：<strong>admin</strong> / <strong>admin123</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">帳號</label>
              <input
                className="form-control"
                placeholder="帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">密碼</label>
              <input
                type="password"
                className="form-control"
                placeholder="密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-danger py-2 small">{String(error)}</div>}
            <button type="submit" className="btn btn-dark w-100">登入</button>
          </form>

          <p className="text-center mt-3 mb-0 small">
            還沒有帳號？<Link to="/register">去註冊</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
