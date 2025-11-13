const mysql = require('mysql2');

//Tạo và Export Pool Kết Nối
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'quan_ly_trung_tam'
});

// Export pool để các file khác có thể dùng
module.exports = pool.promise();