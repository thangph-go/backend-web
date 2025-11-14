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

// --- 3. KÍCH HOẠT MIDDLEWARES ---
app.use(cors());
app.use(express.json()); 

// --- 4. KẾT NỐI (CẮM) CÁC API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/taikhoan', taikhoanRoutes);
app.use('/api/hocvien', hocvienRoutes);
app.use('/api/khoahoc', khoahocRoutes);
app.use('/api/dangky', dangkyRoutes);
app.use('/api/tinhthanh', tinhthanhRoutes);
app.use('/api/thongke', thongkeRoutes);

// --- 5. CÁC ROUTE CƠ BẢN (TEST/ROOT) ---
// Route gốc (Health Check)
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Backend!');
});

// --- 6. KHỞI ĐỘNG SERVER ---
app.listen(port, () => {
  console.log(`Server đang chạy tại cổng ${port}`);
});

// end