const pool = require('../config/db');

// === 1. LẤY DANH SÁCH TẤT CẢ TỈNH THÀNH ===
exports.getAllTinhThanh = async (req, res) => {
  try {
    // Chúng ta ORDER BY ten_tinh để danh sách dropdown
    // hiện ra theo thứ tự A-B-C, dễ cho người dùng tìm
    const sql = "SELECT * FROM TINH_THANH ORDER BY ten_tinh ASC";
    
    const [results] = await pool.query(sql);
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi truy vấn tỉnh thành:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};