
const pool = require('../config/db');

// === 1. LẤY DANH SÁCH (GET) ===
exports.getAllHocVien = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM HOC_VIEN WHERE deleted_at IS NULL");
    res.json(results);
  } catch (err) {
    console.error('Lỗi khi truy vấn danh sách học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 2. LẤY MỘT HỌC VIÊN (CHI TIẾT) ===
exports.getHocVienById = async (req, res) => {
  try {
    const { ma_hv } = req.params;
    
    /* * Câu lệnh SQL này JOIN với TINH_THANH 2 lần:
     * - "tt_qq" là bí danh (alias) cho Tỉnh Quê Quán
     * - "tt_tt" là bí danh cho Tỉnh Thường Trú
     * Dùng LEFT JOIN để phòng trường hợp học viên không khai báo tỉnh
     */
    const sql = `
      SELECT 
        hv.*, 
        tt_qq.ten_tinh AS ten_tinh_que_quan,
        tt_tt.ten_tinh AS ten_tinh_thuong_tru
      FROM 
        HOC_VIEN AS hv
      LEFT JOIN 
        TINH_THANH AS tt_qq ON hv.ma_tinh_que_quan = tt_qq.ma_tinh
      LEFT JOIN 
        TINH_THANH AS tt_tt ON hv.ma_tinh_thuong_tru = tt_tt.ma_tinh
      WHERE 
        hv.ma_hoc_vien = ? AND hv.deleted_at IS NULL
    `;
    
    const [results] = await pool.query(sql, [ma_hv]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy học viên' });
    }
    res.json(results[0]);
  } catch (err) {
    console.error('Lỗi khi truy vấn học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 3. TẠO MỚI (POST) - (ĐÃ CẬP NHẬT TỰ SINH MÃ) ===
exports.createNewHocVien = async (req, res) => {
  try {
    // 1. Chỉ lấy thông tin, KHÔNG lấy ma_hoc_vien
    const { ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru } = req.body;
    
    if (!ho_ten) { // Chỉ cần kiểm tra tên
      return res.status(400).json({ error: 'Thiếu họ tên' });
    }

    // --- 2. LOGIC TỰ SINH MÃ HỌC VIÊN ---
    // (Ví dụ: Tìm mã lớn nhất dạng HV001, HV002...)
    const findMaxSql = "SELECT MAX(CAST(SUBSTRING(ma_hoc_vien, 3) AS UNSIGNED)) AS max_id FROM HOC_VIEN";
    const [maxResult] = await pool.query(findMaxSql);
    
    // Lấy ID lớn nhất (ví dụ: 3) và cộng thêm 1
    const newId = (maxResult[0].max_id || 0) + 1;
    
    // Tạo mã mới, ví dụ: "HV" + "00" + "4" = "HV004"
    const newMaHV = 'HV' + String(newId).padStart(3, '0');
    // ------------------------------------

    // 3. Câu lệnh INSERT mới
    const sql = "INSERT INTO HOC_VIEN (ma_hoc_vien, ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru) VALUES (?, ?, ?, ?, ?)";
    const values = [newMaHV, ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru];

    await pool.query(sql, values);
    res.status(201).json({ message: 'Thêm học viên thành công', ma_hoc_vien: newMaHV });

  } catch (err) {
    console.error('Lỗi khi thêm học viên:', err);
    // (Lỗi ER_DUP_ENTRY bây giờ sẽ rất khó xảy ra, nhưng vẫn nên giữ)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Mã học viên đã tồn tại (Lỗi hệ thống)' });
    }
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 4. CẬP NHẬT (PUT) ===
exports.updateHocVien = async (req, res) => {
  try {
    const { ma_hv } = req.params;
    const { ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru } = req.body;
    if (!ho_ten) {
      return res.status(400).json({ error: 'Họ tên là bắt buộc' });
    }
    const sql = "UPDATE HOC_VIEN SET ho_ten = ?, ngay_sinh = ?, ma_tinh_que_quan = ?, ma_tinh_thuong_tru = ? WHERE ma_hoc_vien = ?";
    const values = [ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru, ma_hv];

    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy học viên để cập nhật' });
    }
    res.json({ message: 'Cập nhật học viên thành công', ma_hoc_vien: ma_hv });

  } catch (err) {
    console.error('Lỗi khi cập nhật học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

// === 5. XÓA MỀM (DELETE) ===
exports.deleteHocVien = async (req, res) => {
  try {
    const { ma_hv } = req.params;
    const sql = "UPDATE HOC_VIEN SET deleted_at = NOW() WHERE ma_hoc_vien = ? AND deleted_at IS NULL";
    
    const [result] = await pool.query(sql, [ma_hv]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy học viên để xóa' });
    }
    res.json({ message: 'Xóa học viên thành công (soft delete)', ma_hoc_vien: ma_hv });

  } catch (err) {
    console.error('Lỗi khi xóa mềm học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};


// ... (Giữ nguyên 5 hàm CRUD của học viên ở trên) ...

// === 6. TÌM KIẾM HỌC VIÊN (THEO MÃ HOẶC TÊN) ===
exports.searchHocVien = async (req, res) => {
  try {
    // Lấy từ khóa tìm kiếm từ query string (ví dụ: /api/hocvien/search?q=An)
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm (query "q")' });
    }

    // Tạo từ khóa tìm kiếm cho SQL (thêm dấu % ở đầu và cuối)
    const keyword = `%${q}%`;

    /*
     * Câu lệnh SQL này:
     * 1. Tìm trong bảng HOC_VIEN
     * 2. Điều kiện là (WHERE):
     * - ma_hoc_vien GIỐNG (LIKE) từ khóa
     * - HOẶC ho_ten GIỐNG (LIKE) từ khóa
     * 3. VÀ chỉ tìm những học viên chưa bị xóa mềm
     */
    const sql = `
      SELECT * FROM HOC_VIEN 
      WHERE 
        (ma_hoc_vien LIKE ? OR ho_ten LIKE ?) 
        AND deleted_at IS NULL
    `;

    const [results] = await pool.query(sql, [keyword, keyword]);

    // Trả về mảng kết quả (có thể là mảng rỗng nếu không tìm thấy)
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi tìm kiếm học viên:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};