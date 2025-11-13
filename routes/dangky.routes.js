const express = require('express');
const router = express.Router();
const dangkyController = require('../controllers/dangky.controller');

const authMiddleware = require('../middleware/auth.middleware');


router.get('/khoahoc/:ma_kh', authMiddleware, dangkyController.getEnrollmentsByCourse);

// POST /api/dangky/ (Đăng ký học viên)
router.post('/', authMiddleware, dangkyController.registerStudentToCourse);

// PUT /api/dangky/ (Cập nhật kết quả)
router.put('/', authMiddleware, dangkyController.updateEnrollmentResult);

module.exports = router;