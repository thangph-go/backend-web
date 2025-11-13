const pool = require('../config/db');

// === 1. LẤY LỊCH SỬ HỌC TẬP (CẬP NHẬT) ===
exports.getStudentHistory = async (req, res) => {
  try {
    const { ma_hv } = req.params;

    const sql = `
      SELECT 
        dk.ma_khoa_hoc,
        kh.ten_khoa,
        kh.thoi_gian_bat_dau,
        kh.thoi_gian_ket_thuc, -- <-- THÊM DÒNG NÀY
        dk.ngay_dang_ky,
        dk.ket_qua
      FROM 
        DANG_KY AS dk
      JOIN 
        KHOA_HOC AS kh ON dk.ma_khoa_hoc = kh.ma_khoa_hoc
      WHERE 
        dk.ma_hoc_vien = ?
      ORDER BY 
        kh.thoi_gian_bat_dau DESC
    `;
    
    const [results] = await pool.query(sql, [ma_hv]);
    res.json(results);
  } catch (err) {
    console.error('Lỗi khi truy vấn lịch sử học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};


// ... (Giữ nguyên hàm getStudentHistory ở trên) ...

// === 2. THỐNG KÊ HỌC VIÊN THEO QUÊ QUÁN ===
exports.getStatsByHometown = async (req, res) => {
  try {
    /* * Câu lệnh SQL này:
     * 1. JOIN HOC_VIEN (hv) với TINH_THANH (tt)
     * 2. Chỉ lấy học viên CHƯA BỊ XÓA (hv.deleted_at IS NULL)
     * 3. Nhóm (GROUP BY) các học viên theo mã tỉnh
     * 4. Đếm (COUNT) số lượng trong mỗi nhóm và đặt tên là 'so_luong'
     * 5. Lấy 'ten_tinh' để hiển thị
     */
    const sql = `
      SELECT 
        hv.ma_tinh_que_quan,
        tt.ten_tinh,
        COUNT(*) AS so_luong
      FROM 
        HOC_VIEN AS hv
      JOIN 
        TINH_THANH AS tt ON hv.ma_tinh_que_quan = tt.ma_tinh
      WHERE 
        hv.deleted_at IS NULL
      GROUP BY 
        hv.ma_tinh_que_quan, tt.ten_tinh
      ORDER BY
        so_luong DESC;
    `;

    const [results] = await pool.query(sql);
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi thống kê theo quê quán:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};


// ... (Giữ nguyên các hàm thống kê khác) ...

// === 3. THỐNG KÊ TÌNH HÌNH MỞ KHÓA HỌC (THEO NĂM) ===
exports.getStatsByCourse = async (req, res) => {
  try {
    // Lấy năm từ query string (ví dụ: /api/thongke/khoahoc?year=2025)
    const { year } = req.query;

    // Bắt buộc người dùng phải cung cấp năm
    if (!year) {
      return res.status(400).json({ error: 'Thiếu tham số "year" (năm) trên URL' });
    }

    /*
     * Câu lệnh SQL này:
     * 1. Dùng KHOA_HOC (kh) làm bảng chính.
     * 2. LEFT JOIN với DANG_KY (dk) để đếm cả các khóa học có 0 học viên.
     * 3. Lọc (WHERE) theo năm bắt đầu (YEAR(...)) và khóa học chưa bị xóa mềm.
     * 4. Nhóm (GROUP BY) theo từng khóa học.
     * 5. Đếm (COUNT) tổng số lượt đăng ký (sẽ là 0 nếu không có ai).
     * 6. Đếm có điều kiện (SUM(CASE...)) cho số lượng Đạt và Không Đạt.
     */
    const sql = `
      SELECT 
        kh.ma_khoa_hoc,
        kh.ten_khoa,
        kh.thoi_gian_bat_dau,
        COUNT(dk.ma_hoc_vien) AS so_luong_hoc_vien,
        SUM(CASE WHEN dk.ket_qua = 'DAT' THEN 1 ELSE 0 END) AS so_luong_dat,
        SUM(CASE WHEN dk.ket_qua = 'KHONG DAT' THEN 1 ELSE 0 END) AS so_luong_khong_dat
      FROM 
        KHOA_HOC AS kh
      LEFT JOIN 
        DANG_KY AS dk ON kh.ma_khoa_hoc = dk.ma_khoa_hoc
      WHERE 
        YEAR(kh.thoi_gian_bat_dau) = ? 
        AND kh.deleted_at IS NULL
      GROUP BY 
        kh.ma_khoa_hoc, kh.ten_khoa, kh.thoi_gian_bat_dau
      ORDER BY
        kh.thoi_gian_bat_dau;
    `;

    const [results] = await pool.query(sql, [year]);
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi thống kê khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 4. THỐNG KÊ HỌC VIÊN THEO TỈNH THƯỜNG TRÚ ===
exports.getStatsByThuongTru = async (req, res) => {
  try {
    /*
     * Câu lệnh SQL này y hệt thống kê quê quán,
     * chỉ thay 'ma_tinh_que_quan' bằng 'ma_tinh_thuong_tru'
     */
    const sql = `
      SELECT 
        hv.ma_tinh_thuong_tru,
        tt.ten_tinh,
        COUNT(*) AS so_luong
      FROM 
        HOC_VIEN AS hv
      JOIN 
        TINH_THANH AS tt ON hv.ma_tinh_thuong_tru = tt.ma_tinh
      WHERE 
        hv.deleted_at IS NULL
      GROUP BY 
        hv.ma_tinh_thuong_tru, tt.ten_tinh
      ORDER BY
        so_luong DESC;
    `;

    const [results] = await pool.query(sql);
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi thống kê theo tỉnh thường trú:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 5. THỐNG KÊ TỔNG QUAN (CHO DASHBOARD) ===
exports.getDashboardStats = async (req, res) => {
  try {
    /*
     * Câu lệnh SQL này chạy 3 truy vấn con (subquery)
     * để đếm 3 chỉ số trong 1 lần gọi API
     */
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM HOC_VIEN WHERE deleted_at IS NULL) AS totalHocVien,
        (SELECT COUNT(*) FROM KHOA_HOC WHERE deleted_at IS NULL) AS totalKhoaHoc,
        (SELECT COUNT(*) FROM DANG_KY) AS totalDangKy
    `;
    
    // (Lưu ý: Bảng DANG_KY không có deleted_at theo thiết kế của bạn)

    const [results] = await pool.query(sql);
    
    // results sẽ là một mảng chỉ có 1 object: 
    // [ { totalHocVien: 5, totalKhoaHoc: 3, totalDangKy: 7 } ]
    res.json(results[0]); 

  } catch (err) {
    console.error('Lỗi khi thống kê dashboard:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};