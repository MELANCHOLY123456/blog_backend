import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    获取所有分类列表
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const queryText = 'SELECT * FROM categories ORDER BY category_id ASC';
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

/**
 * @route   GET /api/categories/articles-with-categories
 * @desc    获取文章列表及其分类信息
 * @access  Public
 */
router.get('/articles-with-categories', async (req, res) => {
    try {
        const [articles] = await db.query(`
            SELECT 
                a.*, 
                COALESCE(
                    CASE 
                        WHEN COUNT(c.category_id) = 0 THEN JSON_ARRAY()
                        ELSE JSON_ARRAYAGG(c.name)
                    END, 
                    JSON_ARRAY()
                ) AS categories
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

            // 过滤掉null值
            article.categories = article.categories.filter(cat => cat !== null);

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

/**
 * @route   GET /api/categories/:name/articles
 * @desc    根据分类名称获取文章列表
 * @access  Public
 */
router.get('/:name/articles', async (req, res) => {
    try {
        const categoryName = req.params.name;

        // 验证分类名称
        if (!categoryName) {
            return res.status(400).json({
                status: 'error',
                message: '分类名称不能为空'
            });
        }

        // 查询指定分类下的文章
        const [articles] = await db.query(`
            SELECT 
                a.*, 
                COALESCE(
                    CASE 
                        WHEN COUNT(c.category_id) = 0 THEN JSON_ARRAY()
                        ELSE JSON_ARRAYAGG(c.name)
                    END, 
                    JSON_ARRAY()
                ) AS categories
            FROM articles a
            LEFT JOIN article_categories ac ON a.article_id = ac.article_id
            LEFT JOIN categories c ON ac.category_id = c.category_id
            WHERE a.article_id IN (
                SELECT ac.article_id 
                FROM article_categories ac 
                JOIN categories cat ON ac.category_id = cat.category_id 
                WHERE cat.name = ?
            )
            GROUP BY a.article_id
            ORDER BY a.upload_time DESC
        `, [categoryName]);

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

            // 过滤掉null值
            article.categories = article.categories.filter(cat => cat !== null);

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
            message: 'Error retrieving articles by category',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/categories
 * @desc    创建新分类
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        // 基本验证
        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: '分类名称是必填字段'
            });
        }

        // 检查分类是否已存在
        const [existingRows] = await db.query('SELECT category_id FROM categories WHERE name = ?', [name]);
        if (existingRows.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: '分类已存在'
            });
        }

        // 插入新分类
        const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);

        const categoryId = result.insertId;

        // 获取创建的分类信息
        const [categoryRows] = await db.query('SELECT * FROM categories WHERE category_id = ?', [categoryId]);

        res.status(201).json({
            status: 'success',
            message: '分类创建成功',
            data: categoryRows[0]
        });
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).json({
            status: 'error',
            message: '创建分类失败',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

export default router;