const express = require("express");
const router = express.Router();
const taikhoanController = require("../controllers/taikhoan.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

router.get("/", [authMiddleware, adminMiddleware], taikhoanController.getAllAccounts);

module.exports = router;