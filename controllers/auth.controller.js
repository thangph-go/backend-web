const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;

exports.register = async(req, res) => {
    try {
        const {ten_dang_nhap, mat_khau, vai_tro} = req.body;

        if (!ten_dang_nhap || !mat_khau || !vai_tro) {
            return res.status(400).json({ error: 'Thiếu thông tin đăng nhập, mật khẩu hoặc vai trò' });
        }

        const validRoles = ["ADMIN", "STAFF"];
        if(!validRoles.includes(vai_tro)) {
            return res.status(400).json({ error: "Vai trò không hợp lệ (Chỉ chấp nhận: ADMIN, STAFF)" });
        }

        const salt = await bcrypt.genSalt(10);
        const mat_khau_bam = await bcrypt.hash(mat_khau, salt);

        const sql = "INSERT INTO TAI_KHOAN (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)";
        const values = [ten_dang_nhap, mat_khau_bam, vai_tro];
        await pool.query(sql, values);

        res.status(201).json({message: "Tạo tài khoản thành công"});

    } catch(err) {
        console.error("Lỗi khi đăng ký: ", error)
        if(err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({error: "Tên tài khoản đã tồn tại"});
        }
        res.status(500).json({error: "Lỗi máy chủ"});
    }
}

exports.login = async(req, res) => {
    try {
        const {ten_dang_nhap, mat_khau} = req.body;

        const sql = "SELECT * FROM TAI_KHOAN WHERE ten_dang_nhap = ?";
        const [users] = await pool.query(sql, [ten_dang_nhap]);

        if(users.length === 0) {
            return res.status(401).json({error: "Tên đăng nhập hoặc mật khẩu không chính xác"});
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
        if(!isMatch) {
            return res.status(401).json({error: "Tên đăng nhập hoặc mật khẩu không chính xác"});
        }

        const payload = {
            id: user.id,
            vai_tro: user.vai_tro,
        }

        const token = jwt.sign(
            payload,
            SECRET_KEY,
            { expiresIn: "1h"},
        );

        res.json({
            message: "Đăng nhập thành công",
            token: token,
        });
        
    } catch(err) {
        console.error("Lỗi khi đăng nhập: ", err);
        res.status(500).json({error: "Lỗi máy chủ"});
    }
}