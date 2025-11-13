/*
 * File: hocvien.controller.js
 * Nhiệm vụ:
 * 1. Xử lý tất cả logic nghiệp vụ (CRUD) cho module "Học Viên".
 * 2. Tương tác với CSDL (bảng HOC_VIEN và TINH_THANH).
 */

const pool = require('../config/db');

// === 1. LẤY DANH SÁCH HỌC VIÊN (GET /api/hocvien) ===
exports.getAllHocVien = async (req, res) => {
  try {
    // Chỉ lấy các học viên chưa bị "xóa mềm"
    const sql = "SELECT * FROM HOC_VIEN WHERE deleted_at IS NULL";
    
    const [results] = await pool.query(sql);
    res.json(results);
    
  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 2. LẤY CHI TIẾT MỘT HỌC VIÊN (GET /api/hocvien/:ma_hv) ===
exports.getHocVienById = async (req, res) => {
  try {
    // 1. Lấy mã học viên từ tham số URL
    const { ma_hv } = req.params;
    
    // 2. Chuẩn bị câu lệnh SQL (JOIN 2 lần với bảng TinhThanh)
    // Dùng LEFT JOIN để vẫn trả về học viên ngay cả khi họ chưa khai báo tỉnh
    const sql = `
      SELECT 
        hv.*, 
        tt_qq.ten_tinh AS ten_tinh_que_quan,  -- Lấy tên tỉnh quê quán
        tt_tt.ten_tinh AS ten_tinh_thuong_tru -- Lấy tên tỉnh thường trú
      FROM 
        HOC_VIEN AS hv
      LEFT JOIN 
        TINH_THANH AS tt_qq ON hv.ma_tinh_que_quan = tt_qq.ma_tinh
      LEFT JOIN 
        TINH_THANH AS tt_tt ON hv.ma_tinh_thuong_tru = tt_tt.ma_tinh
      WHERE 
        hv.ma_hoc_vien = ? AND hv.deleted_at IS NULL
    `;
    
    // 3. Thực thi
    const [results] = await pool.query(sql, [ma_hv]);

    // 4. Trả về kết quả
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy học viên' });
    }
    res.json(results[0]); // Trả về 1 object duy nhất
    
  } catch (err) {
    console.error('Lỗi khi truy vấn chi tiết học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. TẠO MỚI HỌC VIÊN (POST /api/hocvien) ===
// (Đã cập nhật logic Tự Sinh Mã)
exports.createNewHocVien = async (req, res) => {
  try {
    // 1. Lấy thông tin từ React (không bao gồm ma_hoc_vien)
    const { ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru } = req.body;
    
    if (!ho_ten) { // Chỉ cần kiểm tra tên
      return res.status(400).json({ error: 'Thiếu họ tên' });
    }

    // --- 2. LOGIC TỰ SINH MÃ HỌC VIÊN ---
    // (Tìm mã lớn nhất dạng HV001, HV002...)
    const findMaxSql = "SELECT MAX(CAST(SUBSTRING(ma_hoc_vien, 3) AS UNSIGNED)) AS max_id FROM HOC_VIEN";
    const [maxResult] = await pool.query(findMaxSql);
    
    // Lấy ID lớn nhất (ví dụ: 3) và cộng thêm 1 (thành 4)
    const newId = (maxResult[0].max_id || 0) + 1;
    
    // Tạo mã mới, ví dụ: "HV" + "00" + "4" = "HV004"
    // (padStart(3, '0') đảm bảo nó là 001, 010, 100)
    const newMaHV = 'HV' + String(newId).padStart(3, '0');
    // ------------------------------------

    // 3. Câu lệnh INSERT
    const sql = "INSERT INTO HOC_VIEN (ma_hoc_vien, ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru) VALUES (?, ?, ?, ?, ?)";
    const values = [newMaHV, ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru];

    await pool.query(sql, values);
    
    // 4. Trả về 201 Created (kèm theo mã vừa tạo)
    res.status(201).json({ message: 'Thêm học viên thành công', ma_hoc_vien: newMaHV });

  } catch (err) {
    // 5. Xử lý Lỗi
    console.error('Lỗi khi thêm học viên:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Mã học viên đã tồn tại (Lỗi hệ thống)' });
    }
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 4. CẬP NHẬT HỌC VIÊN (PUT /api/hocvien/:ma_hv) ===
exports.updateHocVien = async (req, res) => {
  try {
    // 1. Lấy mã học viên từ URL
    const { ma_hv } = req.params;
    // 2. Lấy thông tin mới từ React
    const { ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru } = req.body;

    if (!ho_ten) {
      return res.status(400).json({ error: 'Họ tên là bắt buộc' });
    }

    // 3. Chuẩn bị câu lệnh SQL
    const sql = `
      UPDATE HOC_VIEN 
      SET ho_ten = ?, ngay_sinh = ?, ma_tinh_que_quan = ?, ma_tinh_thuong_tru = ? 
      WHERE ma_hoc_vien = ?
    `;
    const values = [ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru, ma_hv];

    // 4. Thực thi
    const [result] = await pool.query(sql, values);

    // 5. Kiểm tra xem có update được không
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy học viên để cập nhật' });
    }
    
    // 6. Trả về 200 OK
    res.json({ message: 'Cập nhật học viên thành công', ma_hoc_vien: ma_hv });

  } catch (err) {
    console.error('Lỗi khi cập nhật học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 5. XÓA MỀM HỌC VIÊN (DELETE /api/hocvien/:ma_hv) ===
exports.deleteHocVien = async (req, res) => {
  try {
    // 1. Lấy mã học viên từ URL
    const { ma_hv } = req.params;

    // 2. Chuẩn bị câu lệnh (Không phải DELETE, mà là UPDATE)
    const sql = "UPDATE HOC_VIEN SET deleted_at = NOW() WHERE ma_hoc_vien = ? AND deleted_at IS NULL";
    
    // 3. Thực thi
    const [result] = await pool.query(sql, [ma_hv]);

    // 4. Kiểm tra
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy học viên để xóa' });
    }
    
    // 5. Trả về 200 OK
    res.json({ message: 'Xóa học viên thành công (soft delete)', ma_hoc_vien: ma_hv });

  } catch (err) {
    console.error('Lỗi khi xóa mềm học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 6. TÌM KIẾM HỌC VIÊN (GET /api/hocvien/search) ===
exports.searchHocVien = async (req, res) => {
  try {
    // 1. Lấy từ khóa tìm kiếm từ query string (vd: /api/hocvien/search?q=An)
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm (query "q")' });
    }

    // 2. Tạo từ khóa tìm kiếm SQL (Thêm dấu % để tìm "mờ")
    const keyword = `%${q}%`;

    // 3. Chuẩn bị câu lệnh SQL (Tìm kiếm ở 2 cột)
    const sql = `
      SELECT * FROM HOC_VIEN 
      WHERE 
        (ma_hoc_vien LIKE ? OR ho_ten LIKE ?) 
        AND deleted_at IS NULL
    `;

    // 4. Thực thi
    const [results] = await pool.query(sql, [keyword, keyword]);

    // 5. Trả về kết quả (có thể là mảng rỗng)
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi tìm kiếm học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};