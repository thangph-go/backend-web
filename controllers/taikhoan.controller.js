// File: controllers/taikhoan.controller.js
const pool = require('../config/db');

// === 1. LẤY DANH SÁCH TÀI KHOẢN (Chỉ Admin) ===
exports.getAllAccounts = async (req, res) => {
  try {
    // Chỉ lấy các cột an toàn (không lấy mật khẩu)
    const sql = "SELECT id, ten_dang_nhap, vai_tro FROM TAI_KHOAN";
    
    const [results] = await pool.query(sql);
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách tài khoản:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};