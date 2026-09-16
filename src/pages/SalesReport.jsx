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
    <div className="container" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-bar-chart me-2"></i>
          商品銷售報表
        </h2>
        <button onClick={handleDownloadPdf} className="btn btn-dark btn-sm">
          <i className="bi bi-file-earmark-pdf me-1"></i>
          輸出PDF報表
        </button>
      </div>

      {rows.length === 0 && <p className="text-secondary text-center">目前沒有銷售資料</p>}

      {rows.length > 0 && (
        <div className="card shadow-sm">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>商品</th>
                <th>累計銷量</th>
                <th>總營收</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.productId}>
                  <td>{r.productName}</td>
                  <td>{r.totalQuantity}</td>
                  <td className="text-brand fw-semibold">${r.totalRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
