/*
 * File: khoahoc.controller.js
 * Nhiệm vụ:
 * 1. Xử lý tất cả logic nghiệp vụ (CRUD) cho module "Khóa Học".
 * 2. Tương tác với CSDL (bảng KHOA_HOC).
 */

const pool = require('../config/db');


// === 1. LẤY DANH SÁCH KHÓA HỌC (GET /api/khoahoc) ===
exports.getAllKhoaHoc = async (req, res) => {
  try {
    // Chỉ lấy các khóa học chưa bị "xóa mềm"
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
    // 1. Lấy mã khóa học từ tham số URL
    const { ma_kh } = req.params;

    // 2. Chuẩn bị câu lệnh SQL (Chỉ lấy khóa học chưa bị xóa)
    const sql = "SELECT * FROM KHOA_HOC WHERE ma_khoa_hoc = ? AND deleted_at IS NULL";
    
    // 3. Thực thi
    const [results] = await pool.query(sql, [ma_kh]);

    // 4. Trả về kết quả
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học' });
    }
    res.json(results[0]); // Trả về 1 object duy nhất
    
  } catch (err) {
    console.error('Lỗi khi truy vấn chi tiết khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. TẠO MỚI (POST) ===
exports.createNewKhoaHoc = async (req, res) => {
  try {
    const { ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;
    
    if (!ma_khoa_hoc || !ten_khoa || !thoi_gian_bat_dau) {
      return res.status(400).json({ error: 'Thiếu mã khóa học hoặc tên khóa học hoặc thời gian bắt đầu' });
    }
    
    const final_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;
    
    const sql = "INSERT INTO KHOA_HOC (ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc) VALUES (?, ?, ?, ?, ?)";
    const values = [ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, final_ket_thuc];

    await pool.query(sql, values);
    res.status(201).json({ message: 'Thêm khóa học thành công', ma_khoa_hoc: ma_khoa_hoc });

  } catch (err) {
    console.error('Lỗi khi thêm khóa học:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Mã khóa học đã tồn tại' });
    }
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 4. CẬP NHẬT (PUT) ===
exports.updateKhoaHoc = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    const { ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;

    if(!ten_khoa || !thoi_gian_bat_dau) {
      return res.status(400).json({ error: 'Tên khóa học và thời gian bắt đầu là bắt buộc' });
    }

    const final_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;

    const sql = "UPDATE KHOA_HOC SET ten_khoa = ?, noi_dung = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ? WHERE ma_khoa_hoc = ?";
    const values = [ten_khoa, noi_dung, thoi_gian_bat_dau, final_ket_thuc, ma_kh];

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học để cập nhật' });
    }
    res.json({ message: 'Cập nhật khóa học thành công', ma_khoa_hoc: ma_kh });

  } catch (err) {
    console.error('Lỗi khi cập nhật khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 5. XÓA MỀM KHÓA HỌC (DELETE /api/khoahoc/:ma_kh) ===
exports.deleteKhoaHoc = async (req, res) => {
  try {
    // 1. Lấy mã khóa học từ URL
    const { ma_kh } = req.params;

    // 2. Chuẩn bị câu lệnh (Không phải DELETE, mà là UPDATE)
    const sql = "UPDATE KHOA_HOC SET deleted_at = NOW() WHERE ma_khoa_hoc = ? AND deleted_at IS NULL";
    
    // 3. Thực thi
    const [result] = await pool.query(sql, [ma_kh]);

    // 4. Kiểm tra
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học để xóa' });
    }
    
    // 5. Trả về 200 OK
    res.json({ message: 'Xóa khóa học thành công (soft delete)', ma_khoa_hoc: ma_kh });

  } catch (err) {
    console.error('Lỗi khi xóa mềm khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};