const express = require("express");
const router = express.Router();
const dangkyController = require("../controllers/dangky.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/khoa_hoc/:ma_khoa_hoc", authMiddleware, dangkyController.getEnrollmentsByCourse);
router.get("/", authMiddleware, dangkyController.registerStudentToCourse);
router.get("/", authMiddleware, dangkyController.updateEnrollmentResult);

module.exports = router;