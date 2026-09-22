# MiniShopApi 前端 — minishop_frontend

會員購物網站的前端，串接 [MiniShopApi](https://github.com/yuchun0410/MiniShopApi) 後端，採前後端分離架構。

線上展示：https://mini-shop-frontend-blond.vercel.app（免費方案，閒置後首次載入需約 30 秒喚醒）

## 技術棧

| 分類 | 技術 |
| --- | --- |
| 框架 | React 19、Vite |
| 路由 | React Router 7 |
| HTTP 客戶端 | Axios（攔截器自動帶入／換發 JWT） |
| 樣式 | 自訂品牌配色（深青藍主色），非 Bootstrap 預設藍 |
| 部署 | Vercel（靜態建置產物） |

## 功能頁面

| 頁面 | 路徑 | 說明 | 存取限制 |
| --- | --- | --- | --- |
| 登入 | `/login` | 帳號密碼登入，取得 Access／Refresh Token | 公開 |
| 註冊 | `/register` | 新會員註冊 | 公開 |
| 商品列表 | `/products` | 換頁＋關鍵字搜尋，加入購物車 | 需登入 |
| 購物車 | `/cart` | 修改數量、刪除品項、結帳 | 需登入 |
| 訂單查詢 | `/orders` | 查詢自己的歷史訂單與明細 | 需登入 |
| 會員管理 | `/members` | 查詢會員列表、調整角色 | 僅管理員 |
| 銷售報表 | `/reports` | 商品銷售彙總，匯出中文 PDF | 僅管理員 |

## 核心設計

**路由保護**：`components/ProtectedRoute.jsx` 提供 `PrivateRoute`／`AdminRoute` 兩種包裝元件，依登入狀態與角色（MEMBER／ADMIN）決定是否放行，未通過驗證會導向登入頁。

**身份驗證流程**：`context/AuthContext.jsx` 在應用程式掛載時呼叫 `/members/me` 確認登入狀態；`api.js` 的 Axios 攔截器在每次請求自動帶入 `localStorage` 裡的 Access Token，遇到 401 時自動用 Refresh Token 換發新 Access Token 並重試原本的請求，使用者關閉瀏覽器再打開也不需要重新登入。

**API 串接**：後端網址透過環境變數 `VITE_API_BASE_URL` 設定，本機開發未設定時預設連到 `http://localhost:8080/api`，部署到 Vercel 時改指向 Render 上的正式後端網址。

## 快速開始

```bash
npm install
npm run dev
```

需要搭配 [MiniShopApi 後端](https://github.com/yuchun0410/MiniShopApi) 一起啟動，預設會連到 `http://localhost:8080/api`。

若要打包正式版本：

```bash
npm run build
npm run preview
```

## 部署

正式環境部署在 Vercel，讀取此專案的靜態建置產物（`npm run build`）。部署時需在 Vercel 專案設定裡加上環境變數 `VITE_API_BASE_URL`，指向後端（Render）的正式網址。
