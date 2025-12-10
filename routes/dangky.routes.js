const express = require('express');
const router = express.Router();
const dangkyController = require('../controllers/dangky.controller');

const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// GET /api/dangky/khoahoc/:ma_kh
router.get('/khoahoc/:ma_kh', authMiddleware, adminMiddleware, dangkyController.getAllEnrollmentsByCourse);

// GET /api.dangky/du-dieu-kien/:ma_hv
router.get('/du-dieu-kien/:ma_kh', authMiddleware, dangkyController.getEligibleStudents);

// POST /api/dangky
router.post('/', authMiddleware,  dangkyController.registerStudentToCourse);

// PUT /api/dangky/
router.put('/', authMiddleware, dangkyController.updateEnrollmentResult);

// GET /api/dangky/hocvien/:ma_hv
router.get('/hocvien/:ma_hv', authMiddleware, dangkyController.getCoursesByStudent);

module.exports = router;