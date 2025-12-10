require('dotenv').config();
const mysql = require('mysql2');

if (process.env.MYSQL_URL) {
    console.log('Đang kết nối đến Railway Database ...');
    const pool = mysql.createPool(process.env.MYSQL_URL);
    module.exports = pool.promise();
} else {
    console.log('Đang kết nối đến Local Database ...');
    const pool = createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    module.exports = pool.promise();
}