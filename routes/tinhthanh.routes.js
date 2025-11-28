const express = require('express');
const router = express.Router();
const tinhthanhController = require('../controllers/tinhthanh.controller');

// GET /api/tinhthanh/ (Lấy danh sách)
router.get('/', tinhthanhController.getAllTinhThanh);

module.exports = router;