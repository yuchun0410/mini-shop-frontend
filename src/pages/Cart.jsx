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
    <div className="container" style={{ maxWidth: 700 }}>
      <h2 className="mb-4">
        <i className="bi bi-cart3 me-2"></i>
        購物車
      </h2>

      {items.length === 0 && (
        <div className="text-center text-secondary py-5">
          <i className="bi bi-cart-x fs-1 d-block mb-2"></i>
          購物車是空的
        </div>
      )}

      {items.length > 0 && (
        <div className="card shadow-sm mb-3">
          <ul className="list-group list-group-flush">
            {items.map((item) => (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{item.product.name} — ${item.product.price} x {item.quantity}</span>
                <div className="d-flex align-items-center gap-2">
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-outline-secondary" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span className="btn btn-outline-secondary disabled">{item.quantity}</span>
                    <button className="btn btn-outline-secondary" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(item.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {items.length > 0 && (
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 text-brand">總計：${total}</h4>
          <button onClick={handleCheckout} className="btn btn-dark">送出訂單</button>
        </div>
      )}
      {message && <div className="alert alert-success mt-3 py-2">{message}</div>}
    </div>
  );
}
