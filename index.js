require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const taikhoanRoutes = require("./routes/taikhoan.routes");
const hocvienRoutes = require("./routes/hocvien.routes");
const khoahocRoutes = require("./routes/khoahoc.routes");
const dangkyRoutes = require("./routes/dangky.routes");
const thongkeRoutes = require("./routes/thongke.routes");
const tinhthanhRoutes = require("./routes/tinhthanh.routes");

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/taikhoan", taikhoanRoutes);
app.use("/api/hocvien", hocvienRoutes);
app.use("/api/khoahoc", khoahocRoutes);
app.use("/api/dangky", dangkyRoutes);
app.use("/api/thongke", thongkeRoutes);
app.use("/api/tinhthanh", tinhthanhRoutes);

app.listen(port, () => {
    console.log("Sever đang chạy tại cổng: ", port);
});