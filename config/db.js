const mysql = require('mysql2');

// --- Tạo và Export Pool Kết Nối ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '123456', // Sửa lại mật khẩu của bạn
  database: 'quan_ly_trung_tam'
});

// Export pool để các file khác có thể dùng
// .promise() là một nâng cấp để code bạn sau này sạch hơn (dùng async/await)
module.exports = pool.promise();