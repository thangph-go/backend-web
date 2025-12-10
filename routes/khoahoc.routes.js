const express = require('express');
const router = express.Router();
const khoahocController = require('../controllers/khoahoc.controller');

const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Tiến Độ Học Tập
// GET /api/khoahoc/tiendo
router.get('/tiendo', authMiddleware, khoahocController.getNoiDungVaTrangThai);

// POST /api/khoahoc/tiendo/capnhat
router.post('/tiendo/capnhat', authMiddleware, khoahocController.updateTienDoHocVien);

// Quản lý Nội Dung Khoá Học
// GET /api/khoahoc/:ma_kh/noidung
router.get('/:ma_kh/noidung', authMiddleware, khoahocController.getNoiDungByMaKhoaHoc);

// POST /api/khoahoc/:ma_kh/noidung
router.post('/:ma_kh/noidung', authMiddleware, adminMiddleware, khoahocController.addNoiDungKhoaHoc);

// PUT /api/khoahoc/noi/:id_noi_dung
router.put('/noidung/:id_noi_dung', authMiddleware, adminMiddleware, khoahocController.updateNoiDungKhoaHoc);

// DELETE /api/khoahoc/noidung/:id_noi_dung
router.delete('/noidung/:id_noi_dung', authMiddleware, adminMiddleware, khoahocController.deleteNoiDungKhoaHoc);

// Quản lý Khoá Học (CRUD)
// GET /api/khoahoc/
router.get('/', authMiddleware, khoahocController.getAllKhoaHoc);

// GET /api/khoahoc/:ma_kh
router.get('/:ma_kh', authMiddleware, khoahocController.getKhoaHocById);

// POST /api/khoahoc/
router.post('/', authMiddleware, adminMiddleware, khoahocController.createNewKhoaHoc);

// PUT /api/khoahoc/:ma_kh
router.put('/:ma_kh', authMiddleware, adminMiddleware, khoahocController.updateKhoaHoc);

// DELETE /api/khoahoc/:ma_kh
router.delete('/:ma_kh', authMiddleware, adminMiddleware, khoahocController.deleteKhoaHoc);

module.exports = router;