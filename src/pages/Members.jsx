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
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>會員列表</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          placeholder="搜尋帳號或姓名"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">搜尋</button>
      </form>

      {message && <p style={{ color: "red" }}>{message}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {members.map((m) => (
          <li
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "8px 0",
            }}
          >
            <span>
              {m.username}（{m.name || "未設定姓名"}）— {m.email} — <b>{m.role}</b>
            </span>
            <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
              <button onClick={() => handleToggleRole(m)}>
                {m.role === "ADMIN" ? "設為一般會員" : "設為管理員"}
              </button>
              <button onClick={() => handleDelete(m)}>
                刪除
              </button>
            </div>
          </li>
        ))}
      </ul>
      {members.length === 0 && <p>沒有符合的會員</p>}

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 16 }}>
        <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
          上一頁
        </button>
        <span>第 {page} / {totalPages} 頁</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
          下一頁
        </button>
      </div>
    </div>
  );
}
