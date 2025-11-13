const pool = require('../config/db');

// === 1. ĐĂNG KÝ HỌC VIÊN VÀO KHÓA HỌC (POST) ===
// (Chức năng "Ghi danh")
exports.registerStudentToCourse = async (req, res) => {
  try {
    // React sẽ gửi lên: { "ma_hoc_vien": "HV001", "ma_khoa_hoc": "WEB_CB" }
    const { ma_hoc_vien, ma_khoa_hoc } = req.body;

    if (!ma_hoc_vien || !ma_khoa_hoc) {
      return res.status(400).json({ error: 'Thiếu mã học viên hoặc mã khóa học' });
    }

    // Câu lệnh SQL, tự động đặt ket_qua là 'CHUA CAP NHAT'
    const sql = "INSERT INTO DANG_KY (ma_hoc_vien, ma_khoa_hoc, ngay_dang_ky, ket_qua) VALUES (?, ?, ?, 'CHUA CAP NHAT')";
    const values = [ma_hoc_vien, ma_khoa_hoc, new Date()]; // new Date() là ngày giờ hiện tại

    await pool.query(sql, values);
    res.status(201).json({ message: 'Đăng ký học viên thành công' });

  } catch (err) {
    console.error('Lỗi khi đăng ký học viên:', err);
    // Lỗi nếu đăng ký trùng
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Học viên này đã được đăng ký vào khóa học này rồi' });
    }
    // Lỗi nếu mã HV hoặc mã KH không tồn tại
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Mã học viên hoặc mã khóa học không tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 2. CẬP NHẬT KẾT QUẢ (CẤP CHỨNG CHỈ) (PUT) ===
// (Chức năng "Cấp chứng chỉ")
exports.updateEnrollmentResult = async (req, res) => {
  try {
    // React sẽ gửi lên: { "ma_hoc_vien": "HV001", "ma_khoa_hoc": "WEB_CB", "ket_qua": "DAT" }
    const { ma_hoc_vien, ma_khoa_hoc, ket_qua } = req.body;

    // Kiểm tra xem giá trị 'ket_qua' có hợp lệ không
    const validResults = ['DAT', 'KHONG DAT', 'CHUA CAP NHAT'];
    if (!ket_qua || !validResults.includes(ket_qua)) {
      return res.status(400).json({ error: 'Giá trị kết quả không hợp lệ (chỉ chấp nhận: DAT, KHONG DAT, CHUA CAP NHAT)' });
    }

    const sql = "UPDATE DANG_KY SET ket_qua = ? WHERE ma_hoc_vien = ? AND ma_khoa_hoc = ?";
    const values = [ket_qua, ma_hoc_vien, ma_khoa_hoc];

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lượt đăng ký này để cập nhật' });
    }
    res.json({ message: 'Cập nhật kết quả thành công' });

  } catch (err) {
    console.error('Lỗi khi cập nhật kết quả:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. LẤY DANH SÁCH ĐĂNG KÝ CỦA MỘT KHÓA HỌC ===
exports.getEnrollmentsByCourse = async (req, res) => {
  try {
    // Lấy mã khóa học từ URL, ví dụ: /api/dangky/khoahoc/WEB_CB
    const { ma_kh } = req.params;

    /*
     * Câu lệnh SQL này:
     * 1. JOIN DANG_KY (dk) với HOC_VIEN (hv)
     * 2. Lấy ra mã, tên, và kết quả
     * 3. Lọc theo ma_khoa_hoc mà người dùng yêu cầu
     * 4. VÀ chỉ lấy các học viên chưa bị "xóa mềm" (hv.deleted_at IS NULL)
     */
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

    const [results] = await pool.query(sql, [ma_kh]);

    res.json(results); // Trả về danh sách

  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách đăng ký:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};