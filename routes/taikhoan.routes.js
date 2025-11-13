/*
 * File: taikhoan.routes.js
 * Nhiệm vụ:
 * 1. Định nghĩa các "đường dẫn" (endpoints) cho module "Quản lý Tài khoản".
 * 2. Bảo vệ các đường dẫn này, chỉ cho phép ADMIN đã đăng nhập truy cập.
 */

const express = require('express');
const router = express.Router();

// --- 1. IMPORT CÁC MODULE CẦN THIẾT ---

// Import "bộ não" (controller) xử lý logic
const taikhoanController = require('../controllers/taikhoan.controller');

// Import các "người gác cổng" (middleware)
const authMiddleware = require('../middleware/auth.middleware'); // Gác cổng 1: Kiểm tra đăng nhập
const adminMiddleware = require('../middleware/admin.middleware'); // Gác cổng 2: Kiểm tra vai trò Admin

// --- 2. ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN (ROUTES) ---

/**
 * @route   GET /api/taikhoan/
 * @desc    Lấy danh sách tất cả tài khoản (chỉ Admin)
 * @access  Private (Admin Only)
 *
 * Yêu cầu đi vào sẽ được xử lý theo chuỗi:
 * 1. authMiddleware: Kiểm tra xem Token có hợp lệ không?
 * 2. adminMiddleware: Kiểm tra xem Token có vai trò 'ADMIN' không?
 * 3. taikhoanController.getAllAccounts: Nếu qua 2 cổng, thực thi logic.
 */
router.get(
  '/', 
  [authMiddleware, adminMiddleware], // Chạy qua cả 2 lớp bảo vệ
  taikhoanController.getAllAccounts
);

// (Bạn có thể thêm các route khác như Xóa, Sửa tài khoản... ở đây,
// và chúng cũng nên được bảo vệ bởi [authMiddleware, adminMiddleware])

// 3. Xuất (export) router để index.js có thể sử dụng
module.exports = router;