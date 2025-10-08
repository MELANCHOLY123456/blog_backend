const mysql = require('mysql2');

// 从环境变量读取数据库配置，如果没有则使用默认值
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'haoboyang',
    password: process.env.DB_PASSWORD || '15929867187xxx',
    database: process.env.DB_NAME || 'blog_documents',
    port: process.env.DB_PORT || 3306,
    // 连接池配置优化
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'UTF8MB4_GENERAL_CI'
});

module.exports = pool.promise();