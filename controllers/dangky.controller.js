/*
 * File: dangky.controller.js
 * Nhiệm vụ:
 * 1. Xử lý logic nghiệp vụ "Ghi danh" (Tạo mới lượt đăng ký).
 * 2. Xử lý logic "Cập nhật kết quả" (Đạt/Không Đạt) (FR3).
 * 3. Xử lý logic "Lấy danh sách học viên" của một khóa học cụ thể.
 */

const pool = require('../config/db');

// === 1. GHI DANH HỌC VIÊN VÀO KHÓA HỌC (POST /api/dangky) ===
// (Chức năng "Ghi danh")
exports.registerStudentToCourse = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ React (vd: { "ma_hoc_vien": "HV001", "ma_khoa_hoc": "WEB_CB" })
    const { ma_hoc_vien, ma_khoa_hoc } = req.body;

    // 2. Kiểm tra dữ liệu đầu vào
    if (!ma_hoc_vien || !ma_khoa_hoc) {
      return res.status(400).json({ error: 'Thiếu mã học viên hoặc mã khóa học' });
    }

    // 3. Chuẩn bị câu lệnh SQL
    // (Tự động đặt ket_qua là 'CHUA CAP NHAT' và ngay_dang_ky là ngày hiện tại)
    const sql = "INSERT INTO DANG_KY (ma_hoc_vien, ma_khoa_hoc, ngay_dang_ky, ket_qua) VALUES (?, ?, ?, 'CHUA CAP NHAT')";
    const values = [ma_hoc_vien, ma_khoa_hoc, new Date()];

    // 4. Thực thi
    await pool.query(sql, values);
    
    // 5. Trả về 201 Created (Tạo thành công)
    res.status(201).json({ message: 'Đăng ký học viên thành công' });

  } catch (err) {
    // 6. Xử lý Lỗi
    console.error('Lỗi khi đăng ký học viên:', err);
    
    // Lỗi 1: Đăng ký trùng (Khóa chính phức hợp đã tồn tại)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Học viên này đã được đăng ký vào khóa học này rồi' });
    }
    // Lỗi 2: Mã HV hoặc Mã KH không tồn tại (Lỗi Khóa Ngoại)
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Mã học viên hoặc mã khóa học không tồn tại' });
    }
    // Lỗi chung
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 2. CẬP NHẬT KẾT QUẢ (PUT /api/dangky) ===
// (Chức năng "Cấp chứng chỉ")
exports.updateEnrollmentResult = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ React (vd: { "ma_hoc_vien": "HV001", "ma_khoa_hoc": "WEB_CB", "ket_qua": "DAT" })
    const { ma_hoc_vien, ma_khoa_hoc, ket_qua } = req.body;

    // 2. Kiểm tra dữ liệu 'ket_qua' có hợp lệ không
    const validResults = ['DAT', 'KHONG DAT', 'CHUA CAP NHAT'];
    if (!ket_qua || !validResults.includes(ket_qua)) {
      return res.status(400).json({ error: 'Giá trị kết quả không hợp lệ (chỉ chấp nhận: DAT, KHONG DAT, CHUA CAP NHAT)' });
    }

    // 3. Chuẩn bị câu lệnh SQL
    // (Lưu ý: Bảng DANG_KY không dùng xóa mềm nên không cần check deleted_at)
    const sql = "UPDATE DANG_KY SET ket_qua = ? WHERE ma_hoc_vien = ? AND ma_khoa_hoc = ?";
    const values = [ket_qua, ma_hoc_vien, ma_khoa_hoc];

    // 4. Thực thi
    const [result] = await pool.query(sql, values);

    // 5. Kiểm tra xem có hàng nào được cập nhật không
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lượt đăng ký này để cập nhật' });
    }
    
    // 6. Trả về 200 OK
    res.json({ message: 'Cập nhật kết quả thành công' });

  } catch (err) {
    // 7. Xử lý Lỗi
    console.error('Lỗi khi cập nhật kết quả:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. LẤY DANH SÁCH ĐĂNG KÝ CỦA MỘT KHÓA HỌC (GET /api/dangky/khoahoc/:ma_kh) ===
// (Dùng cho trang "Cập nhật kết quả")
exports.getEnrollmentsByCourse = async (req, res) => {
  try {
    // 1. Lấy mã khóa học từ URL (vd: /api/dangky/khoahoc/WEB_CB)
    const { ma_kh } = req.params;

    // 2. Chuẩn bị câu lệnh SQL (JOIN 2 bảng)
    // Lấy thông tin đăng ký (dk) và JOIN với thông tin học viên (hv)
    const sql = `
      SELECT 
        dk.ma_hoc_vien,
        hv.ho_ten,
        dk.ket_qua
      FROM 
        DANG_KY AS dk
      JOIN 
        HOC_VIEN AS hv ON dk.ma_hoc_vien = hv.ma_hoc_vien
      WHERE 
        dk.ma_khoa_hoc = ? 
        AND hv.deleted_at IS NULL
    `;
    // (Lọc các học viên đã bị 'xóa mềm' ra khỏi danh sách)

    // 3. Thực thi
    const [results] = await pool.query(sql, [ma_kh]);

    // 4. Trả về danh sách (có thể là mảng rỗng)
    res.json(results); 

  } catch (err) {
    // 5. Xử lý Lỗi
    console.error('Lỗi khi truy vấn danh sách đăng ký:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};