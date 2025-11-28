const pool = require("../config/db");

exports.getAllTinhThanh = async (req, res) => {
  try {
    const sql = "SELECT * FROM TINH_THANH ORDER BY ten_tinh ASC";
    const [results] = await pool.query(sql);
    res.json(results);

  } catch (err) {
    console.error('Lỗi khi truy vấn tỉnh thành:', err);
    res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
  }
};