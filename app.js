import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articlesRouter from './routes/articles.js';
import categoriesRouter from './routes/categories.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// CORS 配置 - 允许前端跨域访问
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 解析 JSON 请求体
app.use(express.json());

// 根路径 - 服务器信息和API文档概览
app.get('/', (req, res) => {
    res.json({
        message: '博客系统后端服务器正在运行',
        version: '1.0.0',
        description: '这是一个基于Node.js和Express构建的博客系统API服务器',
        api_documentation: {
            base_url: '/api',
            endpoints: {
                articles: {
                    list: 'GET /api/articles',
                    detail: 'GET /api/articles/:id'
                },
                categories: {
                    list: 'GET /api/categories',
                    articlesWithCategories: 'GET /api/categories/articles-with-categories'
                }
            }
        },
        server_info: {
            timestamp: new Date().toISOString(),
            status: 'online'
        },
        documentation: '完整文档请查看项目 README.md 文件'
    });
});

// API 请求日志中间件
app.use('/api', (req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// API 根路径 - API状态检查和版本信息
app.get('/api', (req, res) => {
    res.json({
        message: '博客系统API服务',
        version: '1.0.0',
        status: 'success',
        timestamp: new Date().toISOString(),
        endpoints: {
            articles: '/api/articles',
            categories: '/api/categories'
        }
    });
});

// 挂载路由模块
app.use('/api/articles', articlesRouter);
app.use('/api/categories', categoriesRouter);

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
