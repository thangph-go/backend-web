/*
 * File: auth.routes.js
 * Nhiệm vụ:
 * 1. Định nghĩa các "đường dẫn" (endpoints) công khai (public)
 * cho việc Xác thực (Authentication).
 * 2. Kết nối các đường dẫn này với các hàm xử lý logic (controller) tương ứng.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;