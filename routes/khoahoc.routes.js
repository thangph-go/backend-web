/*
 * File: routes/khoahoc.routes.js
 * Nhiệm vụ: Định tuyến các API liên quan đến khóa học, nội dung và tiến độ học tập.
 */

const express = require('express');
const router = express.Router();
const khoahocController = require('../controllers/khoahoc.controller');

// --- SỬA ĐỔI: Import Middleware đúng chuẩn (bỏ dấu {}) ---
const authMiddleware = require('../middleware/auth.middleware');   // Gác cổng 1: Kiểm tra đăng nhập
const adminMiddleware = require('../middleware/admin.middleware'); // Gác cổng 2: Kiểm tra vai trò Admin 
// --------------------------------------------------------

// ============================================================
// PHẦN 1: ROUTES CHO TIẾN ĐỘ HỌC TẬP (MỚI)
// (Phải đặt trước các routes /:ma_kh để tránh conflict)
// ============================================================

// GET /api/khoahoc/tiendo?ma_khoa_hoc=...&ma_hoc_vien=...
// Lấy danh sách bài học và trạng thái check của học viên (Dùng cho Modal)
router.get('/tiendo', authMiddleware,  khoahocController.getNoiDungVaTrangThai);

// POST /api/khoahoc/tiendo/capnhat
// Cập nhật trạng thái (Check/Uncheck)
router.post('/tiendo/capnhat', authMiddleware, khoahocController.updateTienDoHocVien);

// ============================================================
// PHẦN 2: ROUTES QUẢN LÝ NỘI DUNG/CHƯƠNG CỦA KHÓA HỌC (MỚI)
// ============================================================

// 2. Route QUẢN LÝ NỘI DUNG (Sửa & Xóa)
// PUT: Sửa nội dung (Khắc phục lỗi 404)
router.put('/noidung/:id_noi_dung', authMiddleware, adminMiddleware, khoahocController.updateNoiDungKhoaHoc);

// DELETE: Xóa nội dung
router.delete('/noidung/:id_noi_dung', authMiddleware, adminMiddleware, khoahocController.deleteNoiDungKhoaHoc);


// GET /api/khoahoc/:ma_kh/noidung
// Lấy danh sách các chương của khóa học (Public hoặc cần auth tùy bạn, ở đây để public cho tiện xem)
router.get('/:ma_kh/noidung', authMiddleware, khoahocController.getNoiDungByMaKhoaHoc);

// POST /api/khoahoc/:ma_kh/noidung
// Thêm chương mới vào khóa học
router.post('/:ma_kh/noidung', authMiddleware, adminMiddleware, khoahocController.addNoiDungKhoaHoc);

// ============================================================
// PHẦN 3: ROUTES CRUD CƠ BẢN CHO KHÓA HỌC (CŨ)
// ============================================================

// GET /api/khoahoc
// Lấy danh sách tất cả khóa học
router.get('/', authMiddleware, khoahocController.getAllKhoaHoc);

// GET /api/khoahoc/:ma_kh
// Lấy chi tiết một khóa học
router.get('/:ma_kh', authMiddleware, khoahocController.getKhoaHocById);

// POST /api/khoahoc
// Tạo mới khóa học
router.post('/', authMiddleware, adminMiddleware, khoahocController.createNewKhoaHoc);

// PUT /api/khoahoc/:ma_kh
// Cập nhật thông tin khóa học
router.put('/:ma_kh', authMiddleware, adminMiddleware, khoahocController.updateKhoaHoc);

// DELETE /api/khoahoc/:ma_kh
// Xóa mềm khóa học
router.delete('/:ma_kh', authMiddleware, adminMiddleware, khoahocController.deleteKhoaHoc);

module.exports = router;