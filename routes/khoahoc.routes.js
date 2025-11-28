const express = require("express");
const router = express.Router();
const khoahocController = require("../controllers/khoahoc.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware, khoahocController.getAllKhoaHoc);
router.get("/:ma_khoa_hoc", authMiddleware, khoahocController.getKhoaHocById);
router.post("/", authMiddleware, khoahocController.createNewKhoaHoc);
router.put("/:ma_khoa_hoc", authMiddleware, khoahocController.updateKhoaHoc);
router.delete("/:ma_khoa_hoc", authMiddleware, khoahocController.deleteKhoaHoc);

module.exports = router;