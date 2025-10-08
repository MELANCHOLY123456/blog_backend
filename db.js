const mysql = require('mysql2');

// 从环境变量读取数据库配置
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    // 连接池配置优化
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    queueLimit: 0,
    charset: 'UTF8MB4_GENERAL_CI'
});

module.exports = pool.promise();