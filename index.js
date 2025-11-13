const express = require('express');
const cors = require('cors');

const app = express();
const port = 8000;

// --- 1. Kích hoạt Middlewares ---
app.use(cors());
app.use(express.json());

// --- 2. Kết nối các Routes (Đường dẫn) ---
const hocvienRoutes = require('./routes/hocvien.routes');
app.use('/api/hocvien', hocvienRoutes);

const khoahocRoutes = require('./routes/khoahoc.routes');
app.use('/api/khoahoc', khoahocRoutes);



const dangkyRoutes = require('./routes/dangky.routes.js');
app.use('/api/dangky', dangkyRoutes);

const thongkeRoutes = require('./routes/thongke.routes.js');
app.use('/api/thongke', thongkeRoutes);

const authRoutes = require('./routes/auth.routes.js');
app.use('/api/auth', authRoutes);

const tinhthanhRoutes = require('./routes/tinhthanh.routes.js');
app.use('/api/tinhthanh', tinhthanhRoutes);

const taikhoanRoutes = require('./routes/taikhoan.routes.js');
app.use('/api/taikhoan', taikhoanRoutes);

/*
  Sau này bạn chỉ cần thêm:
  const khoahocRoutes = require('./routes/khoahoc.routes');
  app.use('/api/khoahoc', khoahocRoutes);
*/



// --- 3. Các API kiểm tra (Giữ lại nếu muốn) ---
app.get('/', (req, res) => {
  res.send('Chào mừng đến với Backend!');
});

// Sửa lại /testdb để nó dùng pool mới
const pool = require('./config/db'); // Import pool
app.get('/testdb', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT 1 + 1 AS solution');
    res.json(results[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// --- 4. Khởi động server ---
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});