// File: routes/taikhoan.routes.js
const express = require('express');
const router = express.Router();

// 1. Import Controller
const taikhoanController = require('../controllers/taikhoan.controller');

// 2. Import cả 2 "Người Gác Cổng"
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

/*
 * 3. BẢO VỆ API
 * Yêu cầu đi vào sẽ chạy:
 * authMiddleware (Kiểm tra đăng nhập?) -> adminMiddleware (Kiểm tra vai trò Admin?) -> controller (Lấy data)
 */
router.get(
  '/', 
  [authMiddleware, adminMiddleware], // Chạy qua cả 2 lớp bảo vệ
  taikhoanController.getAllAccounts
);

module.exports = router;