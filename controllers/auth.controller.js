/*
 * File: auth.controller.js
 * Nhiệm vụ:
 * 1. Xử lý logic cho việc "Đăng ký" (Register) tài khoản mới.
 * 2. Xử lý logic cho việc "Đăng nhập" (Login) và cấp Token (JWT).
 */

const pool = require('../config/db');
const bcrypt = require('bcrypt'); // Thư viện để băm (hash) mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện để tạo/đọc JSON Web Token
const SECRET_KEY = process.env.JWT_SECRET; // Tải khóa bí mật từ file .env


// Hàm validate password
exports.validatePassword = (password) => {
  if (!password || password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  if (!/\d/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 số';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ cái';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 chữ in hoa';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt';
  }
  if (/\s/.test(password)) {
    return 'Mật khẩu không được chứa khoảng trắng';
  }
  if (password.length > 100) {
    return 'Mật khẩu không được vượt quá 100 ký tự';
  }
  return null; // Không có lỗi
};

exports.validateUsername = (username) => {
  if (!username || username.length < 3) {
    return 'Tên đăng nhập phải có ít nhất 3 ký tự';
  }
  if (username.length > 100) {
    return 'Tên đăng nhập không được vượt quá 100 ký tự';
  }
  if (/\s/.test(username)) {
    return 'Tên đăng nhập không được chứa khoảng trắng';
  }
  return null;
};


// === 1. ĐĂNG KÝ TÀI KHOẢN (REGISTER) ===
exports.register = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ React (req.body)
    const { ten_dang_nhap, mat_khau, vai_tro } = req.body;

    // 2. Kiểm tra dữ liệu đầu vào
    // (Lưu ý: Bạn nên thêm kiểm tra 'vai_tro' có phải là 'ADMIN' hoặc 'STAFF' không)
    if (!ten_dang_nhap || !mat_khau || !vai_tro) {
      return res.status(400).json({ error: 'Thiếu thông tin đăng nhập, mật khẩu hoặc vai trò' });
    }

    const usernameError = validateUsername(ten_dang_nhap);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }
    const passwordError = validatePassword(mat_khau);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // --- 3. Băm Mật Khẩu (Hashing) ---
    // (Không bao giờ lưu mật khẩu gốc (plain text) vào CSDL)
    
    // 3a. Tạo "Salt": Một chuỗi ngẫu nhiên để chống tấn công "Rainbow Table"
    const salt = await bcrypt.genSalt(10);
    // 3b. Băm mật khẩu (dạng chữ) với Salt
    const mat_khau_bam = await bcrypt.hash(mat_khau, salt);

    // --- 4. Lưu vào Cơ sở dữ liệu ---
    const sql = "INSERT INTO TAI_KHOAN (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)";
    const values = [ten_dang_nhap, mat_khau_bam, vai_tro];

    await pool.query(sql, values);

    // Trả về 201 Created (Tạo thành công)
    res.status(201).json({ message: 'Tạo tài khoản thành công' });

  } catch (err) {
    // --- 5. Xử lý Lỗi ---
    console.error('Lỗi khi đăng ký:', err);
    
    // Xử lý lỗi cụ thể (ví dụ: Tên đăng nhập đã tồn tại)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }
    // Lỗi chung
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

// === 2. ĐĂNG NHẬP (LOGIN) ===
exports.login = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ React
    const { ten_dang_nhap, mat_khau } = req.body;

    // 2. Tìm người dùng trong CSDL
    const sql = "SELECT * FROM TAI_KHOAN WHERE ten_dang_nhap = ?";
    const [users] = await pool.query(sql, [ten_dang_nhap]);

    // 3. Kiểm tra xem có tìm thấy người dùng không
    if (users.length === 0) {
      // Trả về 401 (Unauthorized) - Luôn dùng thông báo chung
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    const user = users[0]; // Lấy thông tin user (bao gồm cả mật khẩu đã băm)

    // 4. So sánh mật khẩu
    // Dùng bcrypt.compare để so sánh mật khẩu GỐC (từ React) 
    // với mật khẩu ĐÃ BĂM (từ CSDL)
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);

    if (!isMatch) {
      // Nếu mật khẩu không khớp
      // Vẫn trả về 401 và thông báo chung (để bảo mật)
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
    }

    // --- 5. TẠO TOKEN (JWT) ---
    // (Nếu mật khẩu khớp, người dùng hợp lệ)
    
    // 5a. Tạo "Payload": Các thông tin sẽ được lưu bên trong Token
    const payload = {
      id: user.id, // ID của người dùng từ CSDL
      vai_tro: user.vai_tro // Vai trò (ADMIN/STAFF)
    };
    
    // 5b. Tạo Token: Ký (sign) payload bằng Khóa Bí Mật
    const token = jwt.sign(
      payload, 
      SECRET_KEY, 
      { expiresIn: '1h' } // Đặt hạn sử dụng (ví dụ: 1 giờ)
    );

    // 6. Gửi Token về cho React
    res.json({
      message: 'Đăng nhập thành công',
      token: token // React sẽ lưu Token này vào localStorage
    });

  } catch (err) {
    // --- 7. Xử lý Lỗi ---
    console.error('Lỗi khi đăng nhập:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};