/*
 * File: auth.middleware.js
 * Nhiệm vụ:
 * 1. "Gác cổng" (Middleware) cho các API yêu cầu phải đăng nhập.
 * 2. Xác thực (verify) JWT Token được gửi lên trong 'Authorization' header.
 * 3. Nếu Token hợp lệ, giải mã payload (chứa id, vai_tro) và gắn vào 'req.user'.
 * 4. Nếu Token không hợp lệ (thiếu, sai, hết hạn), chặn yêu cầu và trả về lỗi 401.
 */

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET; // Tải khóa bí mật từ file .env

/**
 * Middleware xác thực Token (JWT).
 * Chạy trước khi đi vào controller của các API được bảo vệ.
 */
const authMiddleware = (req, res, next) => {
  try {
    // --- 1. Lấy Token từ Header ---
    
    // React (Axios) sẽ gửi header dạng: 'Authorization: Bearer [token]'
    const authHeader = req.headers.authorization;

    // Kiểm tra xem header 'Authorization' có tồn tại không
    if (!authHeader) {
      return res.status(401).json({ error: 'Không tìm thấy Token (Unauthorized)' });
    }

    // --- 2. Tách (Split) Token ---

    // Tách chuỗi "Bearer [token]" tại dấu cách " " và lấy phần tử thứ 2 ([1])
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token không đúng định dạng (Malformed)' });
    }

    // --- 3. Xác Thực (Verify) Token ---

    // Dùng jwt.verify để kiểm tra chữ ký và tính hợp lệ (còn hạn) của Token
    // Nếu Token sai hoặc hết hạn, nó sẽ ném (throw) một lỗi
    const decodedPayload = jwt.verify(token, SECRET_KEY);

    // --- 4. Gắn Dữ Liệu Người Dùng vào Request ---

    // Gắn payload (chứa { id, vai_tro }) vào đối tượng 'req'
    // để các middleware hoặc controller chạy sau (như admin.middleware) có thể sử dụng
    req.user = decodedPayload;

    // --- 5. Đi Tiếp (Next) ---
    
    // Token hợp lệ, cho phép yêu cầu đi tiếp vào bước tiếp theo (controller)
    next();

  } catch (err) {
    // --- 6. Bắt Lỗi (Catch) ---
    
    // Nếu jwt.verify ném lỗi (Token hết hạn, sai chữ ký, v.v.)
    // Trả về lỗi 401
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = authMiddleware;