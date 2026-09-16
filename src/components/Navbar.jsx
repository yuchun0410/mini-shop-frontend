import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------
// Navbar
// ---------------------------------------------
export default function Navbar() {
  const { member, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid #ddd" }}>
      <div style={{ display: "flex", gap: 16 }}>
        <Link to="/products">商品</Link>
        {member?.role === "ADMIN" && <Link to="/members">會員列表</Link>}
        {member?.role === "ADMIN" && <Link to="/reports">銷售報表</Link>}
        <Link to="/cart">購物車</Link>
        <Link to="/orders">我的訂單</Link>
      </div>
      <div>
        {member ? (
          <>
            <span style={{ marginRight: 12 }}>你好，{member.name || member.username}</span>
            <button onClick={handleLogout}>登出</button>
          </>
        ) : (
          <Link to="/login">登入</Link>
        )}
      </div>
    </nav>
  );
}
