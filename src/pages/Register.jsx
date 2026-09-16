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
    <div className="container" style={{ maxWidth: 400 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h2 className="card-title mb-4 text-center">註冊</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">帳號</label>
              <input className="form-control" placeholder="帳號" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">密碼</label>
              <input type="password" className="form-control" placeholder="密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">姓名</label>
              <input className="form-control" placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {error && <div className="alert alert-danger py-2 small">{String(error)}</div>}
            {success && <div className="alert alert-success py-2 small">註冊成功，跳轉登入頁...</div>}
            <button type="submit" className="btn btn-dark w-100">註冊</button>
          </form>
          <p className="text-center mt-3 mb-0 small">
            已經有帳號？<Link to="/login">去登入</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
