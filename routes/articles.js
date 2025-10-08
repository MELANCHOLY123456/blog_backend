const express = require('express');
const router = express.Router();
const db = require('../db');

// 获取所有文章数据
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM articles');
        res.json({
            status: 'success',
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving data from database',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// 根据文章 ID 获取文章详情
router.get('/:id', async (req, res) => {
    const articleId = req.params.id;
    
    // 验证参数
    if (!articleId || isNaN(articleId)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid article ID'
        });
    }
    
    try {
        const [rows] = await db.query('SELECT * FROM articles WHERE article_id = ?', [articleId]);
        if (rows.length > 0) {
            res.json({
                status: 'success',
                data: rows[0]
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Article not found'
            });
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error retrieving article from database',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;