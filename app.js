const express = require('express');
const cors = require('cors');
// 加载环境变量
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // 允许的前端地址
    methods: ['GET', 'POST'], // 允许的 HTTP 方法
    allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
    credentials: true // 如果需要支持跨域携带凭据
}));

app.use(express.json()); // 解析JSON请求体

// 根路径欢迎页面
app.get('/', (req, res) => {
    res.json({
        message: '欢迎使用博客系统 API',
        version: '1.0.0',
        description: '这是一个博客系统的后端 API 服务',
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
        documentation: '请查看项目 README.md 文件获取详细的 API 文档和使用说明'
    });
});

// 路由模块
const articlesRouter = require('./routes/articles');
const categoriesRouter = require('./routes/categories');

// API路由
app.use('/api', (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// 测试接口
app.get('/api', (req, res) => {
    res.json({ message: 'Hello, World!', status: 'success' });
});

// 文章相关路由
app.use('/api/articles', articlesRouter);

// 分类相关路由
app.use('/api/categories', categoriesRouter);

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
