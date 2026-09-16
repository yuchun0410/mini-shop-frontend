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
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm mb-4">
      <div className="container">
        <Link to="/products" className="navbar-brand fw-bold">
          <i className="bi bi-shop me-2"></i>
          MiniShop
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/products" className="nav-link">商品</Link>
            </li>
            <li className="nav-item">
              <Link to="/cart" className="nav-link">購物車</Link>
            </li>
            <li className="nav-item">
              <Link to="/orders" className="nav-link">我的訂單</Link>
            </li>
            {member?.role === "ADMIN" && (
              <>
                <li className="nav-item">
                  <Link to="/members" className="nav-link">會員列表</Link>
                </li>
                <li className="nav-item">
                  <Link to="/reports" className="nav-link">銷售報表</Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {member ? (
              <>
                <span className="me-3 text-secondary">
                  <i className="bi bi-person-circle me-1"></i>
                  你好，{member.name || member.username}
                  {member.role === "ADMIN" && (
                    <span className="badge text-bg-dark ms-2">管理員</span>
                  )}
                </span>
                <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm">
                  登出
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-dark btn-sm">登入</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
