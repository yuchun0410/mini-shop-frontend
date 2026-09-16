import { useEffect, useState } from "react";
import api from "../api";

// ---------------------------------------------
// 購物車頁
// ---------------------------------------------
export default function Cart() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  function loadCart() {
    api.get("/cart").then((res) => setItems(res.data));
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleUpdateQuantity(id, quantity) {
    if (quantity < 1) return;
    await api.put(`/cart/${id}?quantity=${quantity}`);
    loadCart();
  }

  async function handleRemove(id) {
    await api.delete(`/cart/${id}`);
    loadCart();
  }

  async function handleCheckout() {
    try {
      await api.post("/cart/checkout");
      setMessage("結帳成功！");
      loadCart();
    } catch (err) {
      console.error(err);
      setMessage("結帳失敗：" + (err.response?.status || err.message));
    }
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>購物車</h2>
      {items.length === 0 && <p>購物車是空的</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", padding: "8px 0" }}>
            <span>{item.product.name} — ${item.product.price} x {item.quantity}</span>
            <div>
              <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
              <span style={{ margin: "0 8px" }}>{item.quantity}</span>
              <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
              <button onClick={() => handleRemove(item.id)} style={{ marginLeft: 12 }}>刪除</button>
            </div>
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <>
          <h3>總計：${total}</h3>
          <button onClick={handleCheckout}>送出訂單</button>
        </>
      )}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
