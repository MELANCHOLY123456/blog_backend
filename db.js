import mysql from 'mysql2';
import dotenv from 'dotenv';

// 加载环境变量配置
dotenv.config();

/**
 * 数据库连接池配置
 * 使用环境变量配置数据库连接参数
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    queueLimit: 0,
    charset: 'UTF8MB4_GENERAL_CI',
    timezone: '+08:00' // 设置时区为北京时间
});

// 导出 Promise 包装的连接池
export default pool.promise();