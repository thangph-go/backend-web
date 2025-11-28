const express = require('express');
const router = express.Router();
const tinhthanhController = require('../controllers/tinhthanh.controller');

router.get('/', tinhthanhController.getAllTinhThanh);

module.exports = router;