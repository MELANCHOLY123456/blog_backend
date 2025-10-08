import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articlesRouter from './routes/articles.js';
import categoriesRouter from './routes/categories.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 配置 - 允许前端跨域访问
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 解析 JSON 请求体
app.use(express.json());

// 根路径 - API 概览
app.get('/', (req, res) => {
    res.json({
        message: '欢迎使用博客系统 API',
        version: '1.0.0',
        description: '博客系统的后端 API 服务',
        endpoints: {
            articles: {
                list: 'GET /api/articles',
                detail: 'GET /api/articles/:id'
            },
            categories: {
                list: 'GET /api/categories',
                articlesWithCategories: 'GET /api/categories/articles-with-categories'
            }
        },
        documentation: '详细文档请查看 README.md'
    });
});

// API 请求日志中间件
app.use('/api', (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// API 根路径测试接口
app.get('/api', (req, res) => {
    res.json({
        message: 'Hello, World!',
        status: 'success'
    });
});

// 挂载路由模块
app.use('/api/articles', articlesRouter);
app.use('/api/categories', categoriesRouter);

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
