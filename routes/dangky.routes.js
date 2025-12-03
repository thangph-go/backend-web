/*
 * File: routes/dangky.routes.js
 */
const express = require('express');
const router = express.Router();
const dangkyController = require('../controllers/dangky.controller');

// Middleware
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// 1. GET: Lấy TẤT CẢ học viên của khóa (Dùng cho trang Chi tiết khóa học)
router.get('/khoahoc/:ma_kh', authMiddleware, adminMiddleware, dangkyController.getAllEnrollmentsByCourse);

// 2. GET: Lấy học viên ĐỦ ĐIỀU KIỆN (Dùng cho trang Cấp chứng chỉ)
// (Lưu ý: Đặt route này khác route trên để không bị trùng)
router.get('/du-dieu-kien/:ma_kh', authMiddleware, dangkyController.getEligibleStudents);

// 3. POST: Đăng ký
router.post('/', authMiddleware,  dangkyController.registerStudentToCourse);

// 4. PUT: Cập nhật kết quả
router.put('/', authMiddleware, dangkyController.updateEnrollmentResult);

router.get('/hocvien/:ma_hv', authMiddleware, dangkyController.getCoursesByStudent);

module.exports = router;