import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * @route   GET /api/articles
 * @desc    获取所有文章列表
 * @access  Public
 */
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

/**
 * @route   GET /api/articles/:id
 * @desc    根据ID获取文章详情
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    const articleId = req.params.id;
    
    // 参数验证
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

export default router;