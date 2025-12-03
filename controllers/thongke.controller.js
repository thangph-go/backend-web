/*
 * File: thongke.controller.js
 * Nhiệm vụ:
 * 1. Xử lý tất cả logic nghiệp vụ cho các API Thống Kê (Reporting) (FR4).
 * 2. Cung cấp dữ liệu cho Dashboard, Lịch sử học, và các Báo cáo.
 */

const pool = require('../config/db');

// === 1. LẤY LỊCH SỬ HỌC TẬP CỦA HỌC VIÊN (GET /api/thongke/lichsuhocvien/:ma_hv) ===
exports.getStudentHistory = async (req, res) => {
  try {
    // 1. Lấy mã học viên từ URL
    const { ma_hv } = req.params;

    // 2. Chuẩn bị câu lệnh SQL (JOIN 2 bảng)
    // Lấy thông tin đăng ký (dk) VÀ thông tin khóa học (kh)
    const sql = `
      SELECT 
        dk.ma_khoa_hoc,
        kh.ten_khoa,
        kh.thoi_gian_bat_dau,
        kh.thoi_gian_ket_thuc,
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
    
    // 3. Thực thi
    const [results] = await pool.query(sql, [ma_hv]);
    
    // 4. Trả về kết quả (có thể là mảng rỗng)
    res.json(results);
    
  } catch (err) {
    console.error('Lỗi khi truy vấn lịch sử học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 2. THỐNG KÊ HỌC VIÊN THEO QUÊ QUÁN (GET /api/thongke/quequan) ===
exports.getStatsByHometown = async (req, res) => {
  try {
    // 1. Chuẩn bị câu lệnh SQL
    /*
     * Logic:
     * 1. JOIN HOC_VIEN (hv) với TINH_THANH (tt) để lấy Tên tỉnh.
     * 2. Lọc (WHERE) các học viên đã bị "xóa mềm".
     * 3. Nhóm (GROUP BY) theo Tên tỉnh và Mã tỉnh.
     * 4. Đếm (COUNT) số lượng trong mỗi nhóm.
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

    // 2. Thực thi
    const [results] = await pool.query(sql);
    
    // 3. Trả về kết quả
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi thống kê theo quê quán:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. THỐNG KÊ KHÓA HỌC THEO NĂM (GET /api/thongke/khoahoc) ===
exports.getStatsByCourse = async (req, res) => {
  try {
    // 1. Lấy 'year' từ query string (vd: ?year=2025)
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ error: 'Thiếu tham số "year" (năm) trên URL' });
    }

    // 2. Chuẩn bị câu lệnh SQL
    /*
     * Logic:
     * 1. Dùng KHOA_HOC (kh) làm bảng chính.
     * 2. LEFT JOIN với DANG_KY (dk) để giữ lại các khóa học dù có 0 học viên.
     * 3. Lọc (WHERE) theo năm (dùng hàm YEAR()) và các khóa học chưa bị "xóa mềm".
     * 4. Nhóm (GROUP BY) theo từng khóa học.
     * 5. Đếm (COUNT) tổng số học viên.
     * 6. Đếm có điều kiện (SUM(CASE...)) cho số lượng Đạt và Không Đạt.
     */
    const sql = `
      SELECT 
        kh.ma_khoa_hoc,
        kh.ten_khoa,
        kh.thoi_gian_bat_dau,
        COUNT(dk.ma_hoc_vien) AS so_luong_hoc_vien,
        SUM(CASE WHEN dk.ket_qua = 'ĐẠT' THEN 1 ELSE 0 END) AS so_luong_dat,
        SUM(CASE WHEN dk.ket_qua = 'KHÔNG ĐẠT' THEN 1 ELSE 0 END) AS so_luong_khong_dat
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

    // 3. Thực thi
    const [results] = await pool.query(sql, [year]);
    
    // 4. Trả về kết quả
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi thống kê khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 4. THỐNG KÊ HỌC VIÊN THEO TỈNH THƯỜNG TRÚ (GET /api/thongke/thuongtru) ===
exports.getStatsByThuongTru = async (req, res) => {
  try {
    // 1. Chuẩn bị câu lệnh SQL
    // (Logic y hệt Thống kê Quê quán, chỉ thay cột JOIN)
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

    // 2. Thực thi
    const [results] = await pool.query(sql);
    
    // 3. Trả về kết quả
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi thống kê theo tỉnh thường trú:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 5. THỐNG KÊ TỔNG QUAN (CHO DASHBOARD) (GET /api/thongke/dashboard) ===
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Chuẩn bị câu lệnh SQL
    // (Dùng 3 truy vấn con (subquery) song song để lấy 3 chỉ số)
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM HOC_VIEN WHERE deleted_at IS NULL) AS totalHocVien,
        (SELECT COUNT(*) FROM KHOA_HOC WHERE deleted_at IS NULL) AS totalKhoaHoc,
        (SELECT COUNT(*) FROM DANG_KY) AS totalDangKy
    `;
    // (Lưu ý: Bảng DANG_KY không có deleted_at)

    // 2. Thực thi
    const [results] = await pool.query(sql);
    
    // 3. Trả về 1 object duy nhất (ví dụ: { totalHocVien: 5, ... })
    res.json(results[0]); 

  } catch (err) {
    console.error('Lỗi khi thống kê dashboard:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};