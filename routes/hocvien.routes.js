const express = require("express");
const router = express.Router();
const hocvienController = require("../controllers/hocvien.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/search", authMiddleware, hocvienController.searchHocVien);
router.get("/", authMiddleware, hocvienController.getAllHocVien);
router.get("/:ma_hoc_vien", authMiddleware, hocvienController.getHocVienById);
router.post("/", authMiddleware, hocvienController.createNewHocVien);
router.put("/:ma_hoc_vien", authMiddleware, hocvienController.updateHocVien);
router.delete("/:ma_hoc_vien", authMiddleware, hocvienController.deleteHocVien);

module.exports = router;