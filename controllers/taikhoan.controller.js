/*
 * File: taikhoan.controller.js
 * Nhiệm vụ:
 * 1. Xử lý logic nghiệp vụ cho module "Tài Khoản" (vd: xem danh sách).
 * 2. Tương tác với CSDL (bảng TAI_KHOAN).
 */

const pool = require('../config/db');
const bcrypt = require('bcrypt');


const { validatePassword, validateUsername } = require('./auth.controller');

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




exports.createStaffAccount = async (req, res) => {
  try {
    const { ten_dang_nhap, mat_khau } = req.body;

    // Kiểm tra cơ bản
    if (!ten_dang_nhap || !mat_khau) {
      return res.status(400).json({ error: 'Thiếu thông tin đăng nhập hoặc mật khẩu' });
    }

    // Validate username
    const usernameError = validateUsername(ten_dang_nhap);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }

    // Validate password
    const passwordError = validatePassword(mat_khau);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const mat_khau_bam = await bcrypt.hash(mat_khau, salt);

    // Lưu vào DB
    const sql = "INSERT INTO TAI_KHOAN (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)";
    const values = [ten_dang_nhap, mat_khau_bam, 'STAFF'];
    await pool.query(sql, values);

    res.status(201).json({ message: 'Tạo tài khoản thành công' });

  } catch (err) {
    console.error('Lỗi khi tạo tài khoản:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};