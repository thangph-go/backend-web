const pool = require('../config/db');
const bcrypt = require('bcrypt');

const { validatePassword, validateUsername } = require('./auth.controller');

exports.getAllAccounts = async (req, res) => {
    try {
        const sql = "SELECT id, ten_dang_nhap, vai_tro FROM TAI_KHOAN";
        const [results] = await pool.query(sql);

        res.json(results);

    } catch (err) {
        console.error('Lỗi khi truy vấn danh sách tài khoản:', err);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
};

// Cấp tài khoản Nhân Viên
exports.createStaffAccount = async (req, res) => {
    try {
        const { ten_dang_nhap, mat_khau } = req.body;

        if (!ten_dang_nhap || !mat_khau) {
            return res.status(400).json({ error: 'Thiếu thông tin đăng nhập hoặc mật khẩu' });
        }

        const usernameError = validateUsername(ten_dang_nhap);
        if (usernameError) {
            return res.status(400).json({ error: usernameError });
        }
        const passwordError = validatePassword(mat_khau);
        if (passwordError) {
            return res.status(400).json({ error: passwordError });
        }

        const salt = await bcrypt.genSalt(10);
        const mat_khau_bam = await bcrypt.hash(mat_khau, salt);

        const sql = "INSERT INTO TAI_KHOAN (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)";
        const values = [ten_dang_nhap, mat_khau_bam, 'STAFF'];
        await pool.query(sql, values);

        res.status(201).json({ message: 'Tạo tài khoản thành công' });

    } catch (err) {
        console.error('Lỗi khi tạo tài khoản:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
};