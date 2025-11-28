const express = require('express');
const router = express.Router();
const khoahocController = require('../controllers/khoahoc.controller');

const authMiddleware = require('../middleware/auth.middleware');

// GET /api/khoahoc/ (Lấy danh sách)
router.get('/', authMiddleware, khoahocController.getAllKhoaHoc);

// GET /api/khoahoc/:ma_kh (Lấy 1 khóa học)
router.get('/:ma_kh', authMiddleware, khoahocController.getKhoaHocById);

// POST /api/khoahoc/ (Tạo mới)
router.post('/', authMiddleware, khoahocController.createNewKhoaHoc);

// PUT /api/khoahoc/:ma_kh (Cập nhật)
router.put('/:ma_kh', authMiddleware, khoahocController.updateKhoaHoc);

// DELETE /api/khoahoc/:ma_kh (Xóa mềm)
router.delete('/:ma_kh', authMiddleware, khoahocController.deleteKhoaHoc);

module.exports = router;