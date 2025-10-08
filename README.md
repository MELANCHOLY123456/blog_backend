# Blog Backend API

这是一个博客系统的后端 API 服务，基于 Node.js 和 Express 框架构建，提供文章管理、分类管理等功能。

## 技术栈

- Node.js
- Express.js
- MySQL2
- Cors
- Dotenv

## 功能特性

- RESTful API 设计
- 数据库连接池管理
- 环境变量配置
- 跨域资源共享(CORS)支持
- 文章和分类管理

## API 接口

### 文章相关
- `GET /api/articles` - 获取所有文章
- `GET /api/articles/:id` - 获取指定文章详情

### 分类相关
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/articles-with-categories` - 获取带分类的文章列表

## 本地开发环境搭建

### 前置要求

- Node.js (版本 14 或以上)
- MySQL 数据库
- Git

### 克隆项目

```bash
git clone git@github.com:MELANCHOLY123456/blog_backend.git
cd blog_backend
```

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制 `.env.example` 文件并重命名为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，配置数据库连接信息：
   ```env
   # 数据库配置
   DB_HOST=your_database_host
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   DB_PORT=3306
   DB_CONNECTION_LIMIT=10
   ```

### 数据库准备

1. 创建数据库：
   ```sql
   CREATE DATABASE your_database_name;
   ```

2. 导入数据库结构和数据：
   ```bash
   mysql -u root -p blog_documents < blog_documents.sql
   ```

### 启动项目

开发模式启动：
```bash
npm run dev
```

生产模式启动：
```bash
npm start
```

启动后，API 服务将在 `http://localhost:3000` 运行。

## 项目结构

```
backend/
├── app.js              # 应用入口文件
├── db.js               # 数据库连接配置
├── routes/             # API 路由
│   ├── articles.js     # 文章相关路由
│   └── categories.js   # 分类相关路由
├── .env                # 环境变量配置文件
├── .env.example        # 环境变量配置示例
├── package.json        # 项目配置和依赖
└── README.md           # 项目说明文档
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。