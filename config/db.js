const mysql = require('mysql2');

// Kiểm tra xem có biến DATABASE_URL (của Railway) không
if (process.env.MYSQL_URL) {
  // Nếu có (đang chạy trên Railway), tạo pool từ DATABASE_URL
  console.log("Đang kết nối tới Railway Database...");
  const pool = mysql.createPool(process.env.MYSQL_URL);
  module.exports = pool.promise();

} else {
  // Nếu không (đang chạy ở local), dùng thông tin local
  console.log("Đang kết nối tới Local Database...");
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'quan_ly_trung_tam'
  });
  module.exports = pool.promise();
}