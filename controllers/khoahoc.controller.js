const pool = require('../config/db');

// Lấy danh sách khoá học
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

// Lấy chi tiết 1 khoá học
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

// Thêm Khoá Học mới
exports.createNewKhoaHoc = async (req, res) => {
    try {
        const { ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;
        
        if (!ma_khoa_hoc || !ten_khoa || !thoi_gian_bat_dau) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }
        
        const final_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;
        const sql = `
            INSERT INTO 
                KHOA_HOC (ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
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

// Cập nhật Khoá Học
exports.updateKhoaHoc = async (req, res) => {
  try {
    const { ma_kh } = req.params;
    const { ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc } = req.body;

    if(!ten_khoa || !thoi_gian_bat_dau) {
      return res.status(400).json({ error: 'Tên khóa học và thời gian bắt đầu là bắt buộc' });
    }

    const final_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;
    const sql = `
        UPDATE KHOA_HOC 
        SET ten_khoa = ?, noi_dung = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ? 
        WHERE ma_khoa_hoc = ?
    `;
    
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

// Xoá Khoá Học
exports.deleteKhoaHoc = async (req, res) => {
    try {
        const { ma_kh } = req.params;
        const sql = `
            UPDATE KHOA_HOC 
            SET deleted_at = NOW() WHERE ma_khoa_hoc = ? AND deleted_at IS NULL
        `;
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

// Lấy danh sách Nội Dung Khoá Học
exports.getNoiDungByMaKhoaHoc = async (req, res) => {
    try {
        const { ma_kh } = req.params;
        const sql = "SELECT * FROM NOI_DUNG_KHOA_HOC WHERE ma_khoa_hoc = ? ORDER BY thu_tu ASC";
        const [results] = await pool.query(sql, [ma_kh]);
        res.json(results);
    } catch (err) {
        console.error('Lỗi lấy nội dung khóa học:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Thêm Nội Dung Khoá Học
exports.addNoiDungKhoaHoc = async (req, res) => {
    try {
        const { ma_kh } = req.params;
        const { ten_noi_dung, mo_ta, thu_tu } = req.body;

        if (!ten_noi_dung) {
            return res.status(400).json({ error: 'Tên nội dung là bắt buộc' });
        }

        const sql = `
            INSERT INTO NOI_DUNG_KHOA_HOC (ma_khoa_hoc, ten_noi_dung, mo_ta, thu_tu) 
            VALUES (?, ?, ?, ?)
        `;
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

// Cập nhật Nội Dung Khoá Học
exports.updateNoiDungKhoaHoc = async (req, res) => {
    try {
        const { id_noi_dung } = req.params;
        const { ten_noi_dung, mo_ta, thu_tu } = req.body;

        if (!ten_noi_dung) {
            return res.status(400).json({ error: 'Tên nội dung là bắt buộc' });
        }

        const sql = `
            UPDATE NOI_DUNG_KHOA_HOC 
            SET ten_noi_dung = ?, mo_ta = ?, thu_tu = ? WHERE id = ?
        `;
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

// Xoá Nội Dung Khoá Học
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

// Lấy danh sách Nội Dung và Trạng Thái của Học Viên
exports.getNoiDungVaTrangThai = async (req, res) => {
    try {
        const { ma_khoa_hoc, ma_hoc_vien } = req.query; 
        const sql = `
            SELECT 
                nd.id, 
                nd.ten_noi_dung, 
                nd.mo_ta,
                COALESCE(kq.trang_thai, 'CHƯA HOÀN THÀNH') as trang_thai
            FROM NOI_DUNG_KHOA_HOC AS nd
            LEFT JOIN KET_QUA_NOI_DUNG AS kq 
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

// Cập nhật Tiến Độ của Học Viên
exports.updateTienDoHocVien = async (req, res) => {
    try {
        const { ma_hoc_vien, id_noi_dung, trang_thai } = req.body;
        const sql = `
            INSERT INTO KET_QUA_NOI_DUNG (ma_hoc_vien, id_noi_dung, trang_thai, ngay_cap_nhat)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY 
            UPDATE 
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
