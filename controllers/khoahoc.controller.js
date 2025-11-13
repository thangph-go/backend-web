const pool = require('../config/db');

/*
 * Chúng ta cũng sẽ áp dụng "Xóa Mềm" (Soft Delete) cho Khóa Học
 * Bạn cần chạy lệnh SQL này trong Workbench trước:
 *
 * ALTER TABLE KHOA_HOC
 * ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
 *
 */

// === 1. LẤY DANH SÁCH (GET) ===
exports.getAllKhoaHoc = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM KHOA_HOC WHERE deleted_at IS NULL");
    res.json(results);
  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 2. LẤY MỘT KHÓA HỌC (GET BY ID) ===
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
    console.error('Lỗi khi truy vấn khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. TẠO MỚI (POST) ===
exports.createNewKhoaHoc = async (req, res) => {
  try {
    const { ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;
    
    if (!ma_khoa_hoc || !ten_khoa) {
      return res.status(400).json({ error: 'Thiếu mã khóa học hoặc tên khóa học' });
    }
    
    const sql = "INSERT INTO KHOA_HOC (ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc) VALUES (?, ?, ?, ?, ?)";
    const values = [ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc];

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

    if (!ten_khoa) {
      return res.status(400).json({ error: 'Tên khóa học là bắt buộc' });
    }

    const sql = "UPDATE KHOA_HOC SET ten_khoa = ?, noi_dung = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ? WHERE ma_khoa_hoc = ?";
    const values = [ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc, ma_kh];

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

// === 5. XÓA MỀM (DELETE) ===
exports.deleteKhoaHoc = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    const sql = "UPDATE KHOA_HOC SET deleted_at = NOW() WHERE ma_khoa_hoc = ? AND deleted_at IS NULL";
    
    const [result] = await pool.query(sql, [ma_kh]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khóa học để xóa' });
    }
    res.json({ message: 'Xóa khóa học thành công (soft delete)', ma_khoa_hoc: ma_kh });

  } catch (err) {
    console.error('Lỗi khi xóa mềm khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};