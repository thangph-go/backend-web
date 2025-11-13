/*
 * File: admin.middleware.js
 * Nhiệm vụ:
 * 1. "Gác cổng" (Middleware) cho các API yêu cầu quyền ADMIN.
 * 2. KIỂM TRA "SAU" KHI authMiddleware đã chạy.
 * 3. Đọc vai trò (vai_tro) từ 'req.user' (do authMiddleware gắn vào).
 * 4. Nếu vai trò là 'ADMIN', cho phép đi tiếp.
 * 5. Nếu không phải 'ADMIN' (vd: 'STAFF'), chặn yêu cầu và trả về lỗi 403 Forbidden.
 */

/**
 * Middleware kiểm tra quyền Admin.
 * Luôn chạy sau authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  try {
    // --- 1. Kiểm Tra Vai Trò (Role) ---
    // Kiểm tra xem 'req.user' (được tạo bởi authMiddleware) có tồn tại
    // và thuộc tính 'vai_tro' có phải là 'ADMIN' không.
    if (req.user && req.user.vai_tro === 'ADMIN') {
      
      // --- 2. Cho Phép (Pass) ---
      // Người dùng là Admin, cho phép yêu cầu đi tiếp vào controller
      next();

    } else {
      
      // --- 3. Từ Chối (Forbidden) ---
      // Người dùng đã đăng nhập (ví dụ: STAFF) nhưng không có quyền
      // Trả về lỗi 403 Forbidden (Bị cấm)
      return res.status(403).json({ error: 'Truy cập bị cấm. Yêu cầu quyền Admin.' });
    }

  } catch (err) {
    // --- 4. Lỗi Máy Chủ (Catch) ---
    // Đề phòng trường hợp 'req.user' bị lỗi không mong muốn
    console.error('Lỗi nghiêm trọng tại adminMiddleware:', err);
    return res.status(500).json({ error: 'Lỗi máy chủ khi xác thực vai trò Admin' });
  }
};

module.exports = adminMiddleware;