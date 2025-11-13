/*
 * File: taikhoan.controller.js
 * Nhiệm vụ:
 * 1. Xử lý logic nghiệp vụ cho module "Tài Khoản" (vd: xem danh sách).
 * 2. Tương tác với CSDL (bảng TAI_KHOAN).
 */

const pool = require('../config/db');

// === 1. LẤY DANH SÁCH TÀI KHOẢN (GET /api/taikhoan) ===
// (Chức năng này đã được bảo vệ bởi authMiddleware và adminMiddleware)
exports.getAllAccounts = async (req, res) => {
  try {
    // 1. Chuẩn bị câu lệnh SQL
    // (Quan trọng: KHÔNG BAO GIỜ lấy cột 'mat_khau' ra khỏi CSDL)
    const sql = "SELECT id, ten_dang_nhap, vai_tro FROM TAI_KHOAN";
    
    // 2. Thực thi
    const [results] = await pool.query(sql);

    // 3. Trả về danh sách tài khoản
    res.json(results);

  } catch (err) {
    // 4. Xử lý Lỗi
    console.error('Lỗi khi truy vấn danh sách tài khoản:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};