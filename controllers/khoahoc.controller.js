/*
 * File: khoahoc.controller.js
 * Nhiệm vụ:
 * 1. Xử lý tất cả logic nghiệp vụ (CRUD) cho module "Khóa Học".
 * 2. Quản lý nội dung chi tiết (Chương/Phần) của khóa học.
 * 3. Quản lý cập nhật tiến độ học tập (Hoàn thành/Chưa hoàn thành) cho học viên.
 */

const pool = require('../config/db');

// ============================================================
// PHẦN 1: QUẢN LÝ THÔNG TIN CƠ BẢN KHÓA HỌC (CRUD)
// ============================================================

// === 1. LẤY DANH SÁCH KHÓA HỌC (GET /api/khoahoc) ===
exports.getAllKhoaHoc = async (req, res) => {
  try {
    const sql = "SELECT * FROM KHOA_HOC WHERE deleted_at IS NULL";
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 2. LẤY CHI TIẾT MỘT KHÓA HỌC (GET /api/khoahoc/:ma_kh) ===
exports.getKhoaHocById = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    const sql = "SELECT * FROM KHOA_HOC WHERE ma_khoa_hoc = ? AND deleted_at IS NULL";
    const [results] = await pool.query(sql, [ma_kh]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Lỗi khi truy vấn chi tiết khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. TẠO MỚI KHÓA HỌC (POST) ===
exports.createNewKhoaHoc = async (req, res) => {
  try {
    const { ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;
    
    if (!ma_khoa_hoc || !ten_khoa || !thoi_gian_bat_dau) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    
    const final_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;
    const sql = "INSERT INTO KHOA_HOC (ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc) VALUES (?, ?, ?, ?, ?)";
    
    await pool.query(sql, [ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, final_ket_thuc]);
    res.status(201).json({ message: 'Thêm khóa học thành công', ma_khoa_hoc });

  } catch (err) {
    console.error('Lỗi khi thêm khóa học:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Mã khóa học đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 4. CẬP NHẬT KHÓA HỌC (PUT) ===
exports.updateKhoaHoc = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    const { ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;

    if(!ten_khoa || !thoi_gian_bat_dau) {
      return res.status(400).json({ error: 'Tên khóa học và thời gian bắt đầu là bắt buộc' });
    }

    const final_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;
    const sql = "UPDATE KHOA_HOC SET ten_khoa = ?, noi_dung = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ? WHERE ma_khoa_hoc = ?";
    
    const [result] = await pool.query(sql, [ten_khoa, noi_dung, thoi_gian_bat_dau, final_ket_thuc, ma_kh]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học để cập nhật' });
    }
    res.json({ message: 'Cập nhật khóa học thành công', ma_khoa_hoc: ma_kh });

  } catch (err) {
    console.error('Lỗi khi cập nhật khóa học:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 5. XÓA MỀM KHÓA HỌC (DELETE) ===
exports.deleteKhoaHoc = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    const sql = "UPDATE KHOA_HOC SET deleted_at = NOW() WHERE ma_khoa_hoc = ? AND deleted_at IS NULL";
    const [result] = await pool.query(sql, [ma_kh]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học để xóa' });
    }
    res.json({ message: 'Xóa khóa học thành công' });

  } catch (err) {
    console.error('Lỗi khi xóa mềm khóa học:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ============================================================
// PHẦN 6: QUẢN LÝ NỘI DUNG (CHƯƠNG/PHẦN) CỦA KHÓA HỌC
// ============================================================

// === 6.1 LẤY DANH SÁCH NỘI DUNG CỦA 1 KHÓA ===
exports.getNoiDungByMaKhoaHoc = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    // Sắp xếp theo thứ tự để hiển thị đúng trình tự học
    const sql = "SELECT * FROM NOI_DUNG_KHOA_HOC WHERE ma_khoa_hoc = ? ORDER BY thu_tu ASC";
    const [results] = await pool.query(sql, [ma_kh]);
    res.json(results);
  } catch (err) {
    console.error('Lỗi lấy nội dung khóa học:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 6.2 THÊM NỘI DUNG MỚI CHO KHÓA HỌC ===
exports.addNoiDungKhoaHoc = async (req, res) => {
  try {
    const { ma_kh } = req.params; // Lấy từ URL: /api/khoahoc/:ma_kh/noidung
    const { ten_noi_dung, mo_ta, thu_tu } = req.body;

    if (!ten_noi_dung) {
      return res.status(400).json({ error: 'Tên nội dung là bắt buộc' });
    }

    const sql = "INSERT INTO NOI_DUNG_KHOA_HOC (ma_khoa_hoc, ten_noi_dung, mo_ta, thu_tu) VALUES (?, ?, ?, ?)";
    await pool.query(sql, [ma_kh, ten_noi_dung, mo_ta, thu_tu]);

    res.status(201).json({ message: 'Thêm nội dung thành công' });
  } catch (err) {
    if(err.code === 'ER_DATA_TOO_LONG' ) {
      return res.status(400).json({ error: 'Nội dung quá dài' });
    }
    console.error('Lỗi thêm nội dung:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 6.3 XÓA NỘI DUNG KHÓA HỌC ===
exports.deleteNoiDungKhoaHoc = async (req, res) => {
  try {
    const { id_noi_dung } = req.params;
    const sql = "DELETE FROM NOI_DUNG_KHOA_HOC WHERE id = ?";
    await pool.query(sql, [id_noi_dung]);
    res.json({ message: 'Đã xóa nội dung khóa học' });
  } catch (err) {
    console.error('Lỗi xóa nội dung:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// ============================================================
// PHẦN 7: QUẢN LÝ TIẾN ĐỘ HỌC TẬP (KET_QUA_NOI_DUNG)
// ============================================================

// === 7.1 LẤY DANH SÁCH NỘI DUNG + TRẠNG THÁI CỦA HỌC VIÊN (QUAN TRỌNG) ===
// API này dùng để hiển thị trong Modal Checkbox
exports.getNoiDungVaTrangThai = async (req, res) => {
  try {
    const { ma_khoa_hoc, ma_hoc_vien } = req.query; 

    // LEFT JOIN để lấy tất cả bài học, ngay cả khi học viên chưa học (null)
    // COALESCE để chuyển NULL thành 'CHƯA HOÀN THÀNH' cho dễ xử lý ở FE
    const sql = `
        SELECT 
            nd.id, 
            nd.ten_noi_dung, 
            nd.mo_ta,
            COALESCE(kq.trang_thai, 'CHƯA HOÀN THÀNH') as trang_thai
        FROM NOI_DUNG_KHOA_HOC nd
        LEFT JOIN KET_QUA_NOI_DUNG kq 
            ON nd.id = kq.id_noi_dung AND kq.ma_hoc_vien = ?
        WHERE nd.ma_khoa_hoc = ?
        ORDER BY nd.thu_tu ASC
    `;

    const [results] = await pool.query(sql, [ma_hoc_vien, ma_khoa_hoc]);
    res.json(results);
  } catch (err) {
    console.error('Lỗi lấy tiến độ học viên:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 7.2 CẬP NHẬT TIẾN ĐỘ (Check/Uncheck) ===
exports.updateTienDoHocVien = async (req, res) => {
  try {
    const { ma_hoc_vien, id_noi_dung, trang_thai } = req.body;
    // trang_thai: 'HOÀN THÀNH' hoặc 'CHƯA HOÀN THÀNH'

    // Sử dụng cú pháp UPSERT (ON DUPLICATE KEY UPDATE) của MySQL
    // Nếu chưa có dòng này -> Insert
    // Nếu có rồi (trùng cặp ma_hoc_vien, id_noi_dung) -> Update trạng thái
    const sql = `
        INSERT INTO KET_QUA_NOI_DUNG (ma_hoc_vien, id_noi_dung, trang_thai, ngay_cap_nhat)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        trang_thai = VALUES(trang_thai), 
        ngay_cap_nhat = NOW()
    `;

    await pool.query(sql, [ma_hoc_vien, id_noi_dung, trang_thai]);
    res.json({ message: 'Cập nhật tiến độ thành công' });

  } catch (err) {
    console.error('Lỗi cập nhật tiến độ:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// === 6.4 (MỚI) CẬP NHẬT NỘI DUNG KHÓA HỌC ===
exports.updateNoiDungKhoaHoc = async (req, res) => {
  try {
    const { id_noi_dung } = req.params;
    const { ten_noi_dung, mo_ta, thu_tu } = req.body;

    if (!ten_noi_dung) {
      return res.status(400).json({ error: 'Tên nội dung là bắt buộc' });
    }

    const sql = "UPDATE NOI_DUNG_KHOA_HOC SET ten_noi_dung = ?, mo_ta = ?, thu_tu = ? WHERE id = ?";
    const [result] = await pool.query(sql, [ten_noi_dung, mo_ta, thu_tu, id_noi_dung]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy nội dung để sửa' });
    }

    res.json({ message: 'Cập nhật nội dung thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật nội dung:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
};