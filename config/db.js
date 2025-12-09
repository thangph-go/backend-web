require('dotenv').config();
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
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  module.exports = pool.promise();
}