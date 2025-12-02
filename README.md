# Frontend - Web Bán Hàng (React + Vite + MVC Pattern)

## 📁 Cấu trúc thư mục

```
FE_BanHang/
├── public/                 # Static assets
│   └── vite.svg
├── src/
│   ├── models/            # 📊 MODEL - Quản lý dữ liệu và business logic
│   │   └── UserModel.js
│   ├── views/             # 🎨 VIEW - React Components (UI)
│   │   ├── UserView.jsx
│   │   └── UserView.css
│   ├── controllers/       # 🎮 CONTROLLER - Logic xử lý giữa Model-View
│   │   └── UserController.js
│   ├── services/          # 🌐 API Services
│   │   └── apiService.js
│   ├── assets/            # Images, fonts, etc.
│   ├── App.jsx           # Main App Component
│   ├── App.css
│   ├── main.jsx          # Entry point
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## 🏗️ Mô hình MVC trong React

### Model (`src/models/UserModel.js`)
- Quản lý state và business logic
- Validate dữ liệu
- Xử lý data transformation

### View (`src/views/UserView.jsx`)
- React Component hiển thị UI
- Nhận props từ Controller
- Render dữ liệu và xử lý sự kiện UI

### Controller (`src/controllers/UserController.js`)
- Custom Hook kết nối Model và View
- Xử lý logic nghiệp vụ
- Gọi API thông qua Service layer

### Service (`src/services/apiService.js`)
- Gọi API backend
- Sử dụng axios
- Centralized API management

## 🚀 Cài đặt và Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

### 3. Build production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

## 🔌 Kết nối Backend

Frontend sử dụng Vite proxy để kết nối với backend API:

- Backend API: `http://localhost:5000`
- Frontend dev: `http://localhost:3000`
- Proxy: `/api` → `http://localhost:5000`

**Ví dụ:**
- Frontend gọi: `GET /api/users`
- Thực tế gọi: `GET http://localhost:5000/users`

## 📚 API Endpoints (từ Backend)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Kiểm tra server |
| GET | `/users` | Lấy danh sách người dùng |
| POST | `/user` | Thêm người dùng mới |

## 🎯 Tính năng

- ✅ Hiển thị danh sách người dùng
- ✅ Thêm người dùng mới
- ✅ Tải lại danh sách
- ✅ Xử lý loading state
- ✅ Xử lý error
- ✅ Responsive design

## 🛠️ Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool & Dev server
- **Axios** - HTTP client
- **React Router DOM** - Routing (sẵn sàng mở rộng)
- **CSS3** - Styling với Gradient đẹp

## 📝 Scripts

```json
{
  "dev": "vite",              // Chạy dev server
  "build": "vite build",      // Build production
  "preview": "vite preview",  // Preview production build
  "lint": "eslint ."          // Lint code
}
```

## 🎨 UI Features

- Gradient background đẹp mắt
- Card-based user list
- Hover effects
- Loading spinner
- Error/Success alerts
- Responsive design

## 🔄 Workflow MVC

1. User tương tác với **View** (UI)
2. View trigger event đến **Controller**
3. Controller xử lý logic và gọi **Service**
4. Service gọi API backend
5. Controller cập nhật **Model**
6. Model thay đổi state
7. View tự động re-render với dữ liệu mới

## 📦 Dependencies

### Production
- `react` & `react-dom` - Core React
- `axios` - HTTP client
- `react-router-dom` - Routing

### Development
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin cho Vite
- `eslint` & plugins - Code linting

---

**Note:** Đây là folder FRONTEND thuần túy. Backend được quản lý riêng biệt ở folder khác.
