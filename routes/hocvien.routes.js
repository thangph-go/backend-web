const express = require('express');
const router = express.Router();
const hocvienController = require('../controllers/hocvien.controller');

const authMiddleware = require('../middleware/auth.middleware');

// GET /api/hocvien/search
router.get('/search', authMiddleware, hocvienController.searchHocVien);

// GET /api/hocvien/
router.get('/', authMiddleware, hocvienController.getAllHocVien);

// GET /api/hocvien/:ma_hv
router.get('/:ma_hv', authMiddleware, hocvienController.getHocVienById);

// POST /api/hocvien/
router.post('/', authMiddleware, hocvienController.createNewHocVien);

// PUT /api/hocvien/:ma_hv
router.put('/:ma_hv', authMiddleware, hocvienController.updateHocVien);

// DELETE /api/hocvien/:ma_hv
router.delete('/:ma_hv', authMiddleware, hocvienController.deleteHocVien);

module.exports = router;