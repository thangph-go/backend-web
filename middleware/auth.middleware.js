const jwt = require('jsonwebtoken');

// !! QUAN TRỌNG: Dùng chính xác cái Khóa Bí Mật bạn đã dùng trong auth.controller.js
const SECRET_KEY = 'YOUR_SUPER_SECRET_KEY'; 

const authMiddleware = (req, res, next) => {
  try {
    // 1. Lấy token từ header (React sẽ gửi lên)
    // Định dạng sẽ là: "Bearer [token]"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Không tìm thấy Token (Unauthorized)' });
    }

    // 2. Tách chữ "Bearer " ra để lấy token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token không đúng định dạng' });
    }

    // 3. Xác thực Token
    const decodedPayload = jwt.verify(token, SECRET_KEY);

    // 4. (Quan trọng) Lưu thông tin người dùng vào `req`
    // để các hàm controller đằng sau có thể biết ai đang gọi API
    req.user = decodedPayload;

    // 5. Cho phép yêu cầu đi tiếp vào Controller
    next();

  } catch (err) {
    // Nếu token sai hoặc hết hạn, jwt.verify sẽ ném lỗi
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = authMiddleware;