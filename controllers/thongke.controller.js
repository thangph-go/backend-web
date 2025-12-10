const pool = require('../config/db');

// Lấy lịch sử học tập của Học Viên
exports.getStudentHistory = async (req, res) => {
    try {
        const { ma_hv } = req.params;

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
        
        const [results] = await pool.query(sql, [ma_hv]);
        res.json(results);
        
    } catch (err) {
        console.error('Lỗi khi truy vấn lịch sử học viên:', err);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
};

// Thống kê theo Quê Quán
exports.getStatsByHometown = async (req, res) => {
    try {
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

// Thống kê theo Tỉnh Thường Trú
exports.getStatsByThuongTru = async (req, res) => {
    try {
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

// Thống kê Khoá Học theo Năm
exports.getStatsByCourse = async (req, res) => {
    try {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({ error: 'Thiếu tham số "year" (năm) trên URL' });
        }

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

        const [results] = await pool.query(sql, [year]);

        res.json(results);

    } catch (err) {
        console.error('Lỗi khi thống kê khóa học:', err);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
};

// Thống kê tổng quan cho DashBoard
exports.getDashboardStats = async (req, res) => {
  try {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM HOC_VIEN WHERE deleted_at IS NULL) AS totalHocVien,
        (SELECT COUNT(*) FROM KHOA_HOC WHERE deleted_at IS NULL) AS totalKhoaHoc,
        (SELECT COUNT(*) FROM DANG_KY) AS totalDangKy
    `;

    const [results] = await pool.query(sql);
    res.json(results[0]); 

  } catch (err) {
    console.error('Lỗi khi thống kê dashboard:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};