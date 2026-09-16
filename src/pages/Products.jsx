import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

// 後端 application.properties 裡 spring.servlet.multipart.max-file-size 設的上限，
// 這裡先在前端擋一次，選到太大的檔案不用等打完 API 才知道失敗，體驗比較好
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

// ---------------------------------------------
// 商品列表頁
// ---------------------------------------------
export default function Products() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const pageSize = 10;
  const { member } = useAuth();

  // 上架新商品（管理員專用）
  const [uploadName, setUploadName] = useState("");
  const [uploadPrice, setUploadPrice] = useState("");
  const [uploadStock, setUploadStock] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // 每個商品的附件 content-type，例如 { 3: "image/png", 5: "application/pdf" }
  // 值是 null 代表這個商品沒有附件（用 HEAD 請求探測，不用真的把整個檔案抓下來）
  const [attachments, setAttachments] = useState({});

  function loadProducts() {
    api.get(`/products?page=${page}&size=${pageSize}&keyword=${keyword}`).then((res) => {
      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
    });
  }

  useEffect(() => {
    loadProducts();
  }, [page, keyword]);

  // 商品列表換頁/換關鍵字之後，針對畫面上這批商品各自打一次 HEAD，
  // 用回應的 Content-Type header 判斷：沒有附件、圖片、還是其他檔案（例如 PDF）。
  // 用 HEAD 是因為只需要 header，不需要真的把整個檔案內容傳一次。
  useEffect(() => {
    if (products.length === 0) {
      setAttachments({});
      return;
    }
    let cancelled = false;
    Promise.all(
      products.map((p) =>
        api
          .head(`/products/${p.id}/attachment`)
          .then((res) => [p.id, res.headers["content-type"] || null])
          .catch(() => [p.id, null]) // 400 = 這個商品沒有附件
      )
    ).then((entries) => {
      if (!cancelled) {
        setAttachments(Object.fromEntries(entries));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [products]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);          // 換關鍵字要把頁數重設回第 1 頁，不然可能查到超出範圍的空頁
    setKeyword(searchInput);
  }

  async function handleAddToCart(productId) {
    if (!member) {
      setMessage("請先登入才能加入購物車");
      return;
    }
    try {
      // 後端這支是用 @RequestParam 接資料，不是 JSON body
      await api.post(`/cart?productId=${productId}&quantity=1`);
      setMessage("已加入購物車");
    } catch (err) {
      setMessage("加入購物車失敗");
    }
  }

  // 刪除商品：只有管理員看得到這顆按鈕。如果商品還在別人的購物車裡，
  // 後端會因為資料庫外鍵限制回傳 400，這裡把後端的錯誤訊息原樣顯示出來
  async function handleDeleteProduct(productId) {
    try {
      await api.delete(`/products/${productId}`);
      setMessage("刪除成功");
      loadProducts();
    } catch (err) {
      setMessage("刪除失敗：" + (err.response?.data || err.message));
    }
  }

  // 幫既有商品換一張附件：不用把商品刪掉重建，只是換掉 product_attachment 那筆資料
  // 選完檔案就直接打 API，不用另外按送出按鈕，體驗上比較像「點了就換」
  async function handleUpdateAttachment(productId, e) {
    const file = e.target.files[0] || null;
    e.target.value = ""; // 清空 input，不然選同一個檔案第二次不會觸發 onChange
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMessage("檔案太大了，上限是 20MB，請換一個檔案");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/products/${productId}/attachment`, formData);
      setMessage("附件更新成功");
      loadProducts(); // products 陣列換一次參照，會連帶觸發下面偵測 content-type 的 useEffect 重新跑
    } catch (err) {
      setMessage("附件更新失敗：" + (err.response?.data || err.message));
    }
  }

  // 上架新商品：後端這支是 multipart/form-data，用 FormData 帶資料，不能用一般的 JSON body
  // 檔案是選填的：有選檔案才會 append "file"，沒選就不 append，後端 @RequestParam(required = false) 收到的就是 null
  async function handleUpload(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", uploadName);
    formData.append("price", uploadPrice);
    formData.append("stock", uploadStock);
    if (uploadFile) {
      formData.append("file", uploadFile);
    }

    setUploading(true);
    setUploadMessage("");
    try {
      // 不用手動設定 Content-Type，瀏覽器/axios 看到是 FormData 會自動加上正確的
      // multipart/form-data; boundary=... ，自己手動設反而會漏掉 boundary 導致後端解析失敗
      await api.post("/products", formData);
      setUploadMessage("上架成功！");
      setUploadName("");
      setUploadPrice("");
      setUploadStock("");
      setUploadFile(null);
      e.target.reset();
      setPage(1);
      loadProducts();
    } catch (err) {
      setUploadMessage("上架失敗：" + (err.response?.data || err.message));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>商品列表</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          placeholder="搜尋商品名稱"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">搜尋</button>
      </form>

      {member?.role === "ADMIN" && (
        <form
          onSubmit={handleUpload}
          style={{ marginBottom: 24, padding: 12, border: "1px solid #ddd", borderRadius: 4 }}
        >
          <h3 style={{ marginTop: 0 }}>上架新商品（含附件上傳）</h3>
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="商品名稱"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="number"
              step="0.01"
              placeholder="價格"
              value={uploadPrice}
              onChange={(e) => setUploadPrice(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="number"
              placeholder="庫存"
              value={uploadStock}
              onChange={(e) => setUploadStock(e.target.value)}
              required
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            {/* 不限格式：PDF、Excel、圖片都可以上傳；不選檔案也可以送出，只會新增商品本身 */}
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0] || null;
                if (file && file.size > MAX_FILE_SIZE_BYTES) {
                  setUploadMessage("檔案太大了，上限是 20MB，請換一個檔案");
                  setUploadFile(null);
                  e.target.value = ""; // 把選到的檔案從 input 上清掉，不然畫面上還會顯示那個超大檔案的檔名
                  return;
                }
                setUploadMessage("");
                setUploadFile(file);
              }}
            />
            <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0" }}>
              檔案大小上限 20MB
            </p>
          </div>
          <button type="submit" disabled={uploading}>
            {uploading ? "上傳中..." : "上架商品"}
          </button>
          {uploadMessage && <p>{uploadMessage}</p>}
        </form>
      )}

      {message && <p>{message}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.map((p) => {
          const contentType = attachments[p.id];
          const attachmentUrl = `${api.defaults.baseURL}/products/${p.id}/attachment`;
          // 圖片才用 <img> 直接顯示縮圖；其他類型（PDF、Excel...）給一個新分頁開啟/下載的連結，
          // 不強行塞進 <img>（瀏覽器沒辦法把 PDF 當圖片渲染，硬塞只會顯示壞圖示）
          const isImage = contentType && contentType.startsWith("image/");
          const hasOtherAttachment = contentType && !isImage;

          return (
            <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", padding: "8px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {isImage && (
                  <img
                    src={attachmentUrl}
                    alt={p.name}
                    style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4, border: "1px solid #eee" }}
                  />
                )}
                <div>
                  <span>{p.name}（庫存 {p.stock}）— ${p.price}</span>
                  {hasOtherAttachment && (
                    <div>
                      <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>
                        📎 查看附件
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 12 }}>
                <button onClick={() => handleAddToCart(p.id)}>加入購物車</button>
                {member?.role === "ADMIN" && (
                  <>
                    {/* 用 <label> 包住隱藏的 file input，點文字就等於點 input，畫面上不用另外放一顆醜的原生檔案選擇按鈕 */}
                    <label style={{ fontSize: 12, cursor: "pointer", border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px" }}>
                      📎 換附件
                      <input
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => handleUpdateAttachment(p.id, e)}
                      />
                    </label>
                    <button onClick={() => handleDeleteProduct(p.id)}>刪除</button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {products.length === 0 && <p>沒有符合的商品</p>}

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