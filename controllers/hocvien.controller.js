const pool = require("../config/db.js");

exports.getAllHocVien = async (req, res) => {
    try {
        const sql = "SELECT * FROM HOC_VIEN WHERE deleted_at IS NULL";

        const [result] = await pool.query(sql);
        res.json(result);
    } catch(err) {
        console.error("Lỗi khi truy vấn học viên: ", err);
        res.status(500).json({error: "Lỗi khi truy vấn cơ sở dữ liệu"});
    }
};

exports.getHocVienById = async (req, res) => {
    try {
        const {ma_hoc_vien} = req.params;

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

        const [result] = await pool.query(sql, [ma_hoc_vien]);

        if(result.length === 0) {
            return res.status(404).json({ error: "Không tìm thấy học viên"});
        }
        res.json(result[0]);
    } catch(err) {
        console.error("Lỗi khi truy vấn chi tiết học viên: ", err);
        res.status(500).json({error: "Lỗi truy vấn cơ sở dữ liệu"});
    }
};

exports.createNewHocVien = async(req, res) => {
    try {
        const{ ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru } = req.body;

        if(!ho_ten) {
            return res.status(400).json({ error: "Thiếu học tên"});
        }

        const findMaxSql = "SELECT MAX(CAST(SUBSTRING(ma_hoc_vien, 3) AS UNSIGNED)) AS max_id FROM HOC_VIEN";
        const [maxResult] = await pool.query(findMaxSql);
        const newId = (maxResult[0].ma_id || 0) + 1;
        const newMaHV = "HV" + String(newId).padStart(3, "0");

        const sql = "INSERT INTO HOC_VIEN (ma_hoc_vien, ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru) VALUES (?, ?, ?, ?, ?)";
        const values = [newMaHV, ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru];

        await pool.query(sql, values);
        res.status(201).json({ message: "Thêm học viên thành công", ma_hoc_vien: newMaHV});
    } catch(err) {
        console.error("Lỗi khi thêm học viên: ", err);
        if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json({ error: "Mã học viên đã tồn tại (Lỗi hệ thống)"});
        }
        res.status(500).json({ error: "Lỗi khi truy vấn cơ sở dữ liệu"});
    }
}

exports.updateHocVien = async(req, res) => {
    try {
        const {ma_hoc_vien} = req.params;
        const { ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru } = req.body;

        if(!ho_ten) {
            return res.status(400).json({ error: "Họ tên là bắt buộc" });
        }

        const sql = `
            UPDATE HOC_VIEN 
            SET ho_ten = ?, ngay_sinh = ?, ma_tinh_que_quan = ?, ma_tinh_thuong_tru = ? 
            WHERE ma_hoc_vien = ?
        `;
        const values = [ho_ten, ngay_sinh, ma_tinh_que_quan, ma_tinh_thuong_tru, ma_hoc_vien];
        const [result] = await pool.query(sql, values);

        if(result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy học viên để cập nhật"});
        }
        res.json({ message: "Cập nhật học viên thành công: ", ma_hoc_vien: ma_hoc_vien});
    } catch(err) {
        console.log("Lỗi khi cập nhật học viên: ", err);
        res.status(500).json({ error: "Lỗi khi truy vấn cơ sở dữ liệu"});
    }
}

exports.deleteHocVien = async(req, res) => {
    try {
        const {ma_hoc_vien} = req.params;
        const sql = "UPDATE HOC_VIEN SET deleted_at = NOW() WHERE ma_hoc_vien = ? AND deleted_at IS NULL";

        const [result] = await pool.query(sql, [ma_hoc_vien]);
        if(result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy học viên để xoá" });
        }
        res.json({ message: "Xoá học viên thành công: ", ma_hoc_vien: ma_hoc_vien});
    } catch(err) {
        console.log("Lỗi khi xoá học viên: ", err);
        res.status(500).json({error: "Lỗi khi truy vấn cơ sở dữ liệu"});
    }
}

exports.searchHocVien = async(req, res) => {
    try {
        const {p} = req.query;

        if(!q) {
            return res.status(400).json({ error: "Thiếu từ khoá tìm kiếm"});
        }
        const keywork = `%${ q }%`;
        const sql = `
            SELECT * FROM HOC_VIEN 
            WHERE 
            (ma_hoc_vien LIKE ? OR ho_ten LIKE ?) 
            AND deleted_at IS NULL
        `;

        const [result] = await pool.query(sql, [keywork, keywork]);
        res.json(result);
    } catch(err) {
        console.error("Lỗi khi tìm kiếm học viên");
        res.status(500).json({ error: "Lỗi khi truy vấn cơ sở dữ liệu"});
    }
}