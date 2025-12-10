const express = require('express');
const router = express.Router();

const taikhoanController = require('../controllers/taikhoan.controller');

const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// GET /api/taikhoan/
router.get('/', authMiddleware, adminMiddleware, taikhoanController.getAllAccounts);
// POST /api/taikhoan/staff
router.post('/staff', authMiddleware, adminMiddleware, taikhoanController.createStaffAccount);

module.exports = router;