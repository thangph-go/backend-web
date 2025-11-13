const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// === 1. ĐĂNG KÝ TÀI KHOẢN MỚI ===
exports.register = async (req, res) => {
  try {
    const { ten_dang_nhap, mat_khau, vai_tro } = req.body;

    // (Bạn nên thêm kiểm tra 'vai_tro' có hợp lệ không, ví dụ: chỉ 'ADMIN' hoặc 'STAFF')
    if (!ten_dang_nhap || !mat_khau || !vai_tro) {
      return res.status(400).json({ error: 'Thiếu thông tin đăng nhập, mật khẩu hoặc vai trò' });
    }

    // --- Băm Mật Khẩu (Hashing) ---
    // 1. Tạo "Salt": Một chuỗi ngẫu nhiên để tăng bảo mật
    const salt = await bcrypt.genSalt(10);
    // 2. Băm mật khẩu (dạng chữ) với Salt
    const mat_khau_bam = await bcrypt.hash(mat_khau, salt);
    // ---------------------------------

    // 3. Lưu mật khẩu đã băm vào CSDL
    const sql = "INSERT INTO TAI_KHOAN (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)";
    const values = [ten_dang_nhap, mat_khau_bam, vai_tro];

    await pool.query(sql, values);
    res.status(201).json({ message: 'Tạo tài khoản thành công' });

  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// === 2. ĐĂNG NHẬP ===
exports.login = async (req, res) => {
  try {
    const { ten_dang_nhap, mat_khau } = req.body;

    // 1. Tìm người dùng trong CSDL
    const sql = "SELECT * FROM TAI_KHOAN WHERE ten_dang_nhap = ?";
    const [users] = await pool.query(sql, [ten_dang_nhap]);

    // 2. Kiểm tra xem có tìm thấy người dùng không
    if (users.length === 0) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    const user = users[0];

    // 3. So sánh mật khẩu (dạng chữ) với mật khẩu (đã băm) trong CSDL
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

    if (!isMatch) {
      // Nếu không khớp
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    // 4. --- TẠO TOKEN (JWT) ---
    // Nếu mật khẩu khớp, tạo một "vé" (Token)
    const payload = {
      id: user.id, // ID của người dùng từ CSDL
      vai_tro: user.vai_tro // Vai trò (ADMIN/STAFF)
    };
    
    // (Bạn nên tạo một "khóa bí mật" phức tạp hơn và giấu nó đi)
    const SECRET_KEY = 'YOUR_SUPER_SECRET_KEY'; 

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // Token có hạn 1 giờ

    // 5. Gửi Token về cho React
    res.json({
      message: 'Đăng nhập thành công',
      token: token
    });

  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};