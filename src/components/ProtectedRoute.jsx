import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------
// 需要登入才能看的頁面
// ---------------------------------------------
export function PrivateRoute({ children }) {
  const { member, loading } = useAuth();
  if (loading) return <p>載入中...</p>;
  if (!member) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { member, loading } = useAuth();
  if (loading) return <p>載入中...</p>;
  if (!member) return <Navigate to="/login" replace />;
  if (member.role !== "ADMIN") return <Navigate to="/products" replace />;
  return children;
}
