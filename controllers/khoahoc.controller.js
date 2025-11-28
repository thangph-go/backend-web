const pool = require("../config/db");

exports.getAllKhoaHoc = async(req, res) => {
    try {
        const sql = "SELECT * FROM KHOA_HOC WHERE deleted_at IS NULL";
        const [results] = await pool.query(sql);
        
        res.json(results);
    } catch(err) {
        console.error('Lỗi khi truy vấn danh sách khóa học:', err);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
};

exports.getKhoaHocById = async(req, res) => {
    try {
        const {ma_khoa_hoc} = req.params;
        const sql = "SELECT * FROM KHOA_HOC WHERE ma_khoa_hoc = ? AND deleted_at IS NULL";
        const [results] = await pool.query(sql, [ma_khoa_hoc]);
        if(!results.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khóa học' });
        }
        res.json(results[0]);
    } catch (err) {
    console.error('Lỗi khi truy vấn chi tiết khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};

exports.createNewKhoaHoc = async(req, res) => {
    try {
        const {ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc} = req.body;

        if(!ma_khoa_hoc || !ten_khoa || !thoi_gian_bat_dau) {
            return res.status(400).json({error: "Thiếu mã khoá học hoặc tên khoá học hoặc thời gian bắt đầu"});
        }

        const final_tg_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;

        const sql = `
            INSERT INTO KHOA_HOC 
                (ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [ma_khoa_hoc, ten_khoa, noi_dung, thoi_gian_bat_dau, final_tg_ket_thuc];

        await pool.query(sql, values);
        res.status(201).json({ message: 'Thêm khóa học thành công', ma_khoa_hoc: ma_khoa_hoc });
    }  catch (err) {
        console.error('Lỗi khi thêm khóa học:', err);
        if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Mã khóa học đã tồn tại' });
        }
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
};

exports.updateKhoaHoc = async(req, res) => {
    try {
        const {ma_khoa_hoc} = req.params;
        const {ten_khoa, noi_dung, thoi_gian_bat_dau, thoi_gian_ket_thuc} = req.body;

        if(!ten_khoa || !thoi_gian_bat_dau) {
            return res.status(400).json({ error: 'Tên khóa học và thời gian bắt đầu là bắt buộc' });
        }

        const final_tg_ket_thuc = thoi_gian_ket_thuc ? thoi_gian_ket_thuc : null;
        const sql = `
            UPDATE KHOA_HOC 
                SET ten_khoa = ?, noi_dung = ?, thoi_gian_bat_dau = ?, thoi_gian_ket_thuc = ? 
            WHERE ma_khoa_hoc = ?
        `;
        const values = [ten_khoa, noi_dung, thoi_gian_bat_dau, final_tg_ket_thuc, ma_khoa_hoc];

        const [results] = await pool.query(sql, values);

        if(results.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khóa học để cập nhật' });
        }

        res.json({message: "Cập nhật khoá học thành công", ma_khoa_hoc: ma_khoa_hoc});
    } catch(err) {
        console.error('Lỗi khi cập nhật khóa học:', err);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
};

exports.deleteKhoaHoc = async(req, res) => {
    try {
        const {ma_khoa_hoc} = req.params;
        const sql = "UPDATE KHOA_HOC SET deleted_at = NOW() WHERE ma_khoa_hoc = ? AND deleted_at IS NULL";
        const [results] = await pool.require(sql, [ma_khoa_hoc]);

        if(results.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy khóa học để xóa' });
        }
        res.json({ message: 'Xóa khóa học thành công', ma_khoa_hoc: ma_khoa_hoc });
    } catch (err) {
    console.error('Lỗi khi xóa mềm khóa học:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};