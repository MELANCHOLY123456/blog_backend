const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有类别
router.get('/', async (req, res) => {
    try {
        const queryText = 'SELECT * FROM categories ORDER BY name ASC';
        const [rows] = await db.query(queryText);

        res.json({
            status: 'success',
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Database query error:', {
            message: error.message,
            stack: error.stack,
            query: 'SELECT * FROM categories ORDER BY name ASC'
        });

        res.status(500).json({
            status: 'error',
            message: 'Error retrieving categories',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// 获取带类别的文章
router.get('/articles-with-categories', async (req, res) => {
    try {
        const [articles] = await db.query(`
            SELECT 
                a.*, 
                JSON_ARRAYAGG(c.name) AS categories
            FROM articles a
            LEFT JOIN article_categories ac ON a.article_id = ac.article_id
            LEFT JOIN categories c ON ac.category_id = c.category_id
            GROUP BY a.article_id
        `);
        
        // 处理categories字段，确保它是一个数组
        const processedArticles = articles.map(article => {
            // 如果categories是字符串形式的JSON数组，需要解析
            if (typeof article.categories === 'string') {
                try {
                    article.categories = JSON.parse(article.categories);
                } catch (e) {
                    article.categories = [];
                }
            }
            
            // 确保categories是数组
            if (!Array.isArray(article.categories)) {
                article.categories = [];
            }
            
            return article;
        });
        
        res.json({
            status: 'success',
            data: processedArticles,
            count: processedArticles.length
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving articles with categories',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;