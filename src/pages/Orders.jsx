import { useEffect, useState } from "react";
import api from "../api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/orders").then((res) => setOrders(res.data));
  }, []);

  async function handleViewDetail(orderId) {
    if (openOrderId === orderId) {
      // 再按一次就收合
      setOpenOrderId(null);
      setItems([]);
      return;
    }
    const res = await api.get(`/orders/${orderId}/items`);
    setItems(res.data);
    setOpenOrderId(orderId);
  }

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h2 className="mb-4">
        <i className="bi bi-receipt me-2"></i>
        我的訂單
      </h2>

      {orders.length === 0 && (
        <div className="text-center text-secondary py-5">
          <i className="bi bi-inbox fs-1 d-block mb-2"></i>
          還沒有任何訂單
        </div>
      )}

      <div className="card shadow-sm">
        <ul className="list-group list-group-flush">
          {orders.map((order) => (
            <li key={order.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  訂單 #{order.id} — <span className="fw-semibold">${order.totalAmount}</span> — {order.orderDate}
                </span>
                <button onClick={() => handleViewDetail(order.id)} className="btn btn-outline-secondary btn-sm">
                  訂單詳情
                </button>
              </div>
              {openOrderId === order.id && (
                <ul className="list-group list-group-flush mt-2 ms-3">
                  {items.map((item) => (
                    <li key={item.id} className="list-group-item small text-secondary py-1 border-0 ps-0">
                      {item.productName} x {item.quantity}（單價 ${item.unitPrice}）
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
