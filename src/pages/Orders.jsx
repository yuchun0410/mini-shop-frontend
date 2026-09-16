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
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>我的訂單</h2>
      {orders.length === 0 && <p>還沒有任何訂單</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {orders.map((order) => (
          <li key={order.id} style={{ borderBottom: "1px solid #eee", padding: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                訂單 #{order.id} — ${order.totalAmount} — {order.orderDate}
              </span>
              <button onClick={() => handleViewDetail(order.id)}>訂單詳情</button>
            </div>
            {openOrderId === order.id && (
              <ul style={{ listStyle: "none", padding: "8px 0 0 16px", margin: 0 }}>
                {items.map((item) => (
                  <li key={item.id} style={{ fontSize: 14, color: "#555", padding: "4px 0" }}>
                    {item.productName} x {item.quantity}（單價 ${item.unitPrice}）
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
