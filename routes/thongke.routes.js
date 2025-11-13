const express = require('express');
const router = express.Router();
const thongkeController = require('../controllers/thongke.controller');

const authMiddleware = require('../middleware/auth.middleware');

// GET /api/thongke/dashboard
router.get('/dashboard', authMiddleware, thongkeController.getDashboardStats);

// GET /api/thongke/lichsuhocvien/:ma_hv
router.get('/lichsuhocvien/:ma_hv', authMiddleware, thongkeController.getStudentHistory);

// GET /api/thongke/quequan
router.get('/quequan', authMiddleware, thongkeController.getStatsByHometown);

router.get('/thuongtru', thongkeController.getStatsByThuongTru);

// GET /api/thongke/khoahoc
router.get('/khoahoc', authMiddleware, thongkeController.getStatsByCourse);

module.exports = router;