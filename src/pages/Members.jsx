import { useEffect, useState } from "react";
import api from "../api";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 10;

  function loadMembers() {
    api.get(`/members?page=${page}&size=${pageSize}&keyword=${keyword}`).then((res) => {
      setMembers(res.data.content);
      setTotalPages(res.data.totalPages);
    });
  }

  useEffect(() => {
    loadMembers();
  }, [page, keyword]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1); // 換關鍵字要把頁數重設回第 1 頁，不然可能查到超出範圍的空頁
    setKeyword(searchInput);
  }

  async function handleToggleRole(m) {
    const newRole = m.role === "ADMIN" ? "MEMBER" : "ADMIN";
    try {
      await api.put(`/members/${m.id}/role?role=${newRole}`);
      loadMembers();
    } catch (err) {
      setMessage("修改角色失敗：" + (err.response?.data || err.message));
    }
  }

  async function handleDelete(m) {
    try {
      await api.delete(`/members/${m.id}`);
      loadMembers();
    } catch (err) {
      setMessage("刪除失敗：" + (err.response?.data || err.message));
    }
  }

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <h2 className="mb-4">
        <i className="bi bi-people me-2"></i>
        會員列表
      </h2>

      <form onSubmit={handleSearch} className="input-group mb-4" style={{ maxWidth: 400 }}>
        <input
          className="form-control"
          placeholder="搜尋帳號或姓名"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-secondary">
          <i className="bi bi-search"></i> 搜尋
        </button>
      </form>

      {message && <div className="alert alert-danger py-2">{message}</div>}

      <div className="card shadow-sm mb-3">
        <ul className="list-group list-group-flush">
          {members.map((m) => (
            <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>
                {m.username}（{m.name || "未設定姓名"}）— {m.email} —{" "}
                <span className={`badge ${m.role === "ADMIN" ? "text-bg-dark" : "text-bg-secondary"}`}>
                  {m.role}
                </span>
              </span>
              <div className="d-flex gap-2">
                <button onClick={() => handleToggleRole(m)} className="btn btn-outline-secondary btn-sm">
                  {m.role === "ADMIN" ? "設為一般會員" : "設為管理員"}
                </button>
                <button onClick={() => handleDelete(m)} className="btn btn-outline-danger btn-sm">
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {members.length === 0 && <p className="text-secondary text-center">沒有符合的會員</p>}

      <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
        <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="btn btn-outline-secondary btn-sm">
          上一頁
        </button>
        <span>第 {page} / {totalPages} 頁</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="btn btn-outline-secondary btn-sm">
          下一頁
        </button>
      </div>
    </div>
  );
}
