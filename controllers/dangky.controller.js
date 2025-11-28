const pool = require("../config/db");

exports.registerStudentToCourse = async(req, res) => {
    try {
        const {ma_hoc_vien, ma_khoa_hoc} = req.body;
        if(!ma_hoc_vien || !ma_khoa_hoc) {
            return res.status(400).json({error: "Thiếu mã học viên hoặc mã khoá học"});
        }

        const sql = `
            INSERT INTO DANG_KY (ma_hoc_vien, ma_khoa_hoc, ngay_dang_ky, ket_qua) 
            VALUES (?, ?, ?, 'CHUA CAP NHAT')
        `;
        const values = [ma_hoc_vien, ma_khoa_hoc, newDate()];

        await pool.query(sql, values);
    } catch(err) {
        console.error("Lỗi khi đăng ký khoá học: ", err);
        if(err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({error: "Học viên này đã được đăng ký vào khoá học này rồi"});
        }
        if(err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({error: "Mã học viên hoặc khoá học không tồn tại"});
        }
        res.status(500).json({error: "Lỗi truy vấn cơ sở dữ liệu"});
    }
}

exports.updateEnrollmentResult = async(req, res) => {
    try {
        const {ma_hoc_vien, ma_khoa_hoc, ket_qua} = req.body;

        const validResults = ["DAT", "KHONG DAT", "CHUA CAP NHAT"];
        if(!ket_qua || !validResults.includes(ket_qua)) {
            return res.status(400).json({error: "Kết quả không hợp lệ. Chỉ chấp nhận: DAT, KHONG DAT, CHUA CAP NHAT"});
        }

        const sql = "UPDATE DANG_KY SET ket_qua = ? WHERE ma_hoc_vien = ? AND ma_khoa_hoc = ?";
        const values = [ket_qua, ma_hoc_vien, ma_khoa_hoc];

        const [result] = await pool.query(sql, values);

        if(result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy lượt đăng ký này để cập nhật' });
        }

        res.json("Cập nhật kết quả thành công");
    } catch(err) {
        console.err("Lỗi khi cập nhật kết quả: ", err);
        res.status(500).json({error: "Lỗi khi truy vấn cơ sở dữ liệu"});
    }
}

exports.getEnrollmentsByCourse = async(req, res) => {
    try {
        const {ma_khoa_hoc} = req.body;

        const sql = `
            SELECT 
                dk.ma_hoc_vien,
                hv.ho_ten,
                dk.ket_qua
            FROM 
                DANG_KY AS dk
            JOIN 
                HOC_VIEN AS hv ON dk.ma_hoc_vien = hv.ma_hoc_vien
            WHERE 
                dk.ma_khoa_hoc = ? 
                AND hv.deleted_at IS NULL
        `;

        const [result] = await pool.query(sql, [ma_khoa_hoc]);
        res.json(result);
    } catch(err) {
        console.error("Lỗi khi truy vấn danh sách đăng ký: ", err);
        res.status(500).json({ error: "Lỗi ki truy vấn cơ sở dữ liệu"});
    }
};