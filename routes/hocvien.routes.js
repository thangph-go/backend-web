const express = require('express');
const router = express.Router();
const hocvienController = require('../controllers/hocvien.controller');

const authMiddleware = require('../middleware/auth.middleware');

// Định nghĩa các đường dẫn (endpoints) và liên kết chúng với Controller

// GET /api/hocvien/search
router.get('/search', authMiddleware, hocvienController.searchHocVien);

// GET /api/hocvien/ (Lấy danh sách)
router.get('/', authMiddleware, hocvienController.getAllHocVien);

// GET /api/hocvien/:ma_hv (Lấy 1 học viên)
router.get('/:ma_hv', authMiddleware, hocvienController.getHocVienById);

// POST /api/hocvien/ (Tạo mới)
router.post('/', authMiddleware, hocvienController.createNewHocVien);

// PUT /api/hocvien/:ma_hv (Cập nhật)
router.put('/:ma_hv', authMiddleware, hocvienController.updateHocVien);

// DELETE /api/hocvien/:ma_hv (Xóa mềm)
router.delete('/:ma_hv', authMiddleware, hocvienController.deleteHocVien);

// Xuất router này ra để file index.js có thể dùng
module.exports = router;