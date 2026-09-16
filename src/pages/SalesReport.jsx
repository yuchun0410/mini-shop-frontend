import { useEffect, useState } from "react";
import api from "../api";

export default function SalesReport() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/reports/products").then((res) => setRows(res.data));
  }, []);

  async function handleDownloadPdf() {
    const res = await api.get("/reports/products/pdf", { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);

    const link = document.createElement('a');   // 1. 建立一個 <a> 標籤，但先不放進畫面
    link.href = url;                             // 2. 指向剛剛那個暫時網址
    link.download = 'product_sales_report.pdf';  // 3. 指定下載後的檔名
    document.body.appendChild(link);             // 4. 放進頁面裡（不放進去，click() 在某些瀏覽器不會生效）
    link.click();                                // 5. 用程式碼模擬「使用者點擊」這個連結
    document.body.removeChild(link);             // 6. 清理，把這個暫時的 <a> 從頁面移除
    URL.revokeObjectURL(url);                    // 7. 通知瀏覽器可以釋放這個暫時網址佔用的記憶體了
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>商品銷售報表</h2>
      <button onClick={handleDownloadPdf}>輸出PDF報表</button>
      {rows.length === 0 && <p>目前沒有銷售資料</p>}
      {rows.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "8px 4px" }}>商品</th>
              <th style={{ padding: "8px 4px" }}>累計銷量</th>
              <th style={{ padding: "8px 4px" }}>總營收</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.productId} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 4px" }}>{r.productName}</td>
                <td style={{ padding: "8px 4px" }}>{r.totalQuantity}</td>
                <td style={{ padding: "8px 4px" }}>${r.totalRevenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
