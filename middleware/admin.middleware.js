// File: middleware/admin.middleware.js
/*
 * Middleware này dùng để kiểm tra xem người dùng
 * đã đăng nhập CÓ PHẢI LÀ ADMIN không.
 *
 * NÓ PHẢI LUÔN CHẠY SAU 'authMiddleware'
 * (Vì 'authMiddleware' là cái tạo ra req.user)
 */
const adminMiddleware = (req, res, next) => {
  try {
    // 1. Kiểm tra xem req.user (từ authMiddleware) có tồn tại
    //    và vai trò có phải là 'ADMIN' không
    if (req.user && req.user.vai_tro === 'ADMIN') {
      
      // 2. Nếu đúng là ADMIN, cho phép đi tiếp
      next();

    } else {
      // 3. Nếu không phải ADMIN (ví dụ: là STAFF), trả về lỗi 403
      // Lỗi 403 Forbidden = "Tôi biết bạn là ai (đã đăng nhập),
      //                   nhưng bạn KHÔNG CÓ QUYỀN làm việc này."
      return res.status(403).json({ error: 'Truy cập bị cấm. Yêu cầu quyền Admin.' });
    }

  } catch (err) {
    return res.status(500).json({ error: 'Lỗi máy chủ khi xác thực vai trò Admin' });
  }
};

module.exports = adminMiddleware;