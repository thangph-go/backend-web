const express = require('express');
const router = express.Router();
const thongkeController = require('../controllers/thongke.controller');

const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.get("/lichsuhocvien/:ma_hoc_vien", authMiddleware, thongkeController.getStudentHistory);
router.get("/quequan", authMiddleware, thongkeController.getStatsByHometown);
router.get("/thuongtru", authMiddleware, thongkeController.getStatsByThuongTru);
router.get("/khoahoc", authMiddleware, thongkeController.getStatsByCourse);
router.get('/dashboard', authMiddleware, adminMiddleware, thongkeController.getDashboardStats);

module.exports = router;