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
        // 手动处理时间字段，确保返回正确的时间格式
        const articlesWithFormattedTime = rows.map(article => {
            const formattedArticle = { ...article };
            if (formattedArticle.upload_time) {
                // 数据库中存储的是北京时间，将其转换为不带时区信息的字符串
                const uploadTime = new Date(formattedArticle.upload_time);
                formattedArticle.upload_time = uploadTime.getFullYear() + '-' + 
                    String(uploadTime.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(uploadTime.getDate()).padStart(2, '0') + ' ' + 
                    String(uploadTime.getHours()).padStart(2, '0') + ':' + 
                    String(uploadTime.getMinutes()).padStart(2, '0') + ':' + 
                    String(uploadTime.getSeconds()).padStart(2, '0');
            }
            return formattedArticle;
        });
        
        res.json({
            status: 'success',
            data: articlesWithFormattedTime,
            count: articlesWithFormattedTime.length
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
            // 手动处理时间字段，确保返回正确的时间格式
            const articleData = { ...rows[0] };
            if (articleData.upload_time) {
                // 数据库中存储的是北京时间，将其转换为不带时区信息的字符串
                const uploadTime = new Date(articleData.upload_time);
                articleData.upload_time = uploadTime.getFullYear() + '-' + 
                    String(uploadTime.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(uploadTime.getDate()).padStart(2, '0') + ' ' + 
                    String(uploadTime.getHours()).padStart(2, '0') + ':' + 
                    String(uploadTime.getMinutes()).padStart(2, '0') + ':' + 
                    String(uploadTime.getSeconds()).padStart(2, '0');
            }
            
            res.json({
                status: 'success',
                data: articleData
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

/**
 * @route   POST /api/articles
 * @desc    创建新文章
 * @access  Public
 */
router.post('/', async (req, res) => {
    try {
        const { title, content, author, publish_date, categories } = req.body;

        // 基本验证
        if (!title || !content) {
            return res.status(400).json({
                status: 'error',
                message: '标题和内容是必填字段'
            });
        }

        // 插入文章
        // 确保使用北京时间存储时间
        const now = new Date();
        const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
        const formattedBeijingTime = beijingTime.toISOString().replace('T', ' ').substring(0, 19);
        
        const [result] = await db.query(
            'INSERT INTO articles (title, content, author, upload_time) VALUES (?, ?, ?, ?)',
            [title, content, author || null, publish_date || formattedBeijingTime]
        );

        const articleId = result.insertId;
        console.log(`Created article with ID: ${articleId}`);

        // 如果提供了分类信息，则处理分类关联
        if (categories && Array.isArray(categories) && categories.length > 0) {
            // 获取所有分类信息
            const [categoryRows] = await db.query('SELECT category_id, name FROM categories');
            const categoryMap = {};
            categoryRows.forEach(cat => {
                categoryMap[cat.name] = cat.category_id;
            });

            // 插入文章分类关联
            for (const categoryName of categories) {
                const categoryId = categoryMap[categoryName];
                if (categoryId) {
                    const [result] = await db.query(
                        'INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)',
                        [articleId, categoryId]
                    );
                    console.log(`Linked article ${articleId} with category '${categoryName}' (ID: ${categoryId})`);
                }
            }
        }

        // 获取创建的文章信息
        const [articleRows] = await db.query('SELECT * FROM articles WHERE article_id = ?', [articleId]);
        
        // 手动处理时间字段，确保返回正确的时间格式
        const articleData = { ...articleRows[0] };
        if (articleData.upload_time) {
            // 数据库中存储的是北京时间，将其转换为不带时区信息的字符串
            const uploadTime = new Date(articleData.upload_time);
            articleData.upload_time = uploadTime.getFullYear() + '-' + 
                String(uploadTime.getMonth() + 1).padStart(2, '0') + '-' + 
                String(uploadTime.getDate()).padStart(2, '0') + ' ' + 
                String(uploadTime.getHours()).padStart(2, '0') + ':' + 
                String(uploadTime.getMinutes()).padStart(2, '0') + ':' + 
                String(uploadTime.getSeconds()).padStart(2, '0');
        }

        res.status(201).json({
            status: 'success',
            message: '文章创建成功',
            data: articleData
        });
    } catch (error) {
        console.error('Database insert error:', error);
        res.status(500).json({
            status: 'error',
            message: '创建文章失败',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route   PUT /api/articles/:id
 * @desc    更新文章
 * @access  Public
 */
router.put('/:id', async (req, res) => {
    const articleId = req.params.id;

    // 参数验证
    if (!articleId || isNaN(articleId)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid article ID'
        });
    }

    try {
        const { title, content, author, publish_date, categories } = req.body;

        // 检查文章是否存在
        const [existingRows] = await db.query('SELECT article_id FROM articles WHERE article_id = ?', [articleId]);
        if (existingRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Article not found'
            });
        }

        // 构建更新查询
        let updateFields = [];
        let updateValues = [];

        if (title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }

        if (content !== undefined) {
            updateFields.push('content = ?');
            updateValues.push(content);
        }

        if (author !== undefined) {
            updateFields.push('author = ?');
            updateValues.push(author);
        }

        if (publish_date !== undefined) {
            // 确保使用北京时间存储时间
            let formattedTime = publish_date;
            if (!(publish_date instanceof Date)) {
                const date = new Date(publish_date);
                const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
                formattedTime = beijingTime.toISOString().replace('T', ' ').substring(0, 19);
            }
            updateFields.push('upload_time = ?');
            updateValues.push(formattedTime);
        }

        // 如果没有提供任何要更新的字段
        if (updateFields.length === 0 && categories === undefined) {
            return res.status(400).json({
                status: 'error',
                message: '至少需要提供一个要更新的字段'
            });
        }

        // 执行更新文章信息
        if (updateFields.length > 0) {
            // 添加文章ID到参数数组
            updateValues.push(articleId);

            // 执行更新
            await db.query(
                `UPDATE articles SET ${updateFields.join(', ')} WHERE article_id = ?`,
                updateValues
            );
        }

        // 如果提供了分类信息，则更新分类关联
        if (categories !== undefined) {
            // 先删除现有的分类关联
            await db.query('DELETE FROM article_categories WHERE article_id = ?', [articleId]);

            // 如果提供了新的分类信息，则插入新的关联
            if (Array.isArray(categories) && categories.length > 0) {
                // 获取所有分类信息
                const [categoryRows] = await db.query('SELECT category_id, name FROM categories');
                const categoryMap = {};
                categoryRows.forEach(cat => {
                    categoryMap[cat.name] = cat.category_id;
                });

                // 插入新的文章分类关联
                for (const categoryName of categories) {
                    const categoryId = categoryMap[categoryName];
                    if (categoryId) {
                        const [result] = await db.query(
                            'INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)',
                            [articleId, categoryId]
                        );
                        console.log(`Updated article ${articleId} categories: linked with '${categoryName}' (ID: ${categoryId})`);
                    }
                }
            } else {
                console.log(`Updated article ${articleId} categories: cleared all category associations`);
            }
        }

        // 获取更新后的文章信息
        const [updatedRows] = await db.query('SELECT * FROM articles WHERE article_id = ?', [articleId]);

        res.json({
            status: 'success',
            message: '文章更新成功',
            data: updatedRows[0]
        });
    } catch (error) {
        console.error('Database update error:', error);
        res.status(500).json({
            status: 'error',
            message: '更新文章失败',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

export default router;