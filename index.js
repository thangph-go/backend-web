// --- 1. IMPORT CÁC THƯ VIỆN & MODULE ---
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');

// Import các file routes (bản đồ)
const authRoutes = require('./routes/auth.routes.js');
const taikhoanRoutes = require('./routes/taikhoan.routes.js');
const hocvienRoutes = require('./routes/hocvien.routes.js');
const khoahocRoutes = require('./routes/khoahoc.routes.js');
const dangkyRoutes = require('./routes/dangky.routes.js');
const tinhthanhRoutes = require('./routes/tinhthanh.routes.js');
const thongkeRoutes = require('./routes/thongke.routes.js');

// --- 2. KHỞI TẠO ỨNG DỤNG (APP) ---
const app = express();
const port = process.env.PORT || 8000;

// --- 3. KÍCH HOẠT MIDDLEWARES (ĐÃ SỬA ĐỔI) ---

// Lấy danh sách từ .env và tách chuỗi thành mảng dựa trên dấu phẩy
// Nếu không có biến này thì mặc định là mảng rỗng []
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép request từ Postman/Mobile App (không có origin) hoặc request nằm trong whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Lỗi CORS: Domain này không được phép truy cập.'));
    }
  }
};

// Áp dụng config
app.use(cors(corsOptions));
app.use(express.json());

// --- 4. KẾT NỐI (CẮM) CÁC API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/taikhoan', taikhoanRoutes);
app.use('/api/hocvien', hocvienRoutes);
app.use('/api/khoahoc', khoahocRoutes);
app.use('/api/dangky', dangkyRoutes);
app.use('/api/tinhthanh', tinhthanhRoutes);
app.use('/api/thongke', thongkeRoutes);



// --- 5. KHỞI ĐỘNG SERVER ---
app.listen(port, () => {
  console.log(`Server đang chạy tại cổng ${port}`);
});

// end