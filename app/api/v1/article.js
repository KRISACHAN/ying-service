import Router from 'koa-router';
import {
    ArticleValidator,
    PositiveIdParamsValidator,
} from '@validators/article';
import { userAuthMiddleware } from '@middlewares/auth';
import { ArticleDao } from '@dao/article';
import { CommentDao } from '@dao/comment';
import { resolve } from '@utils/resolve';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import log from '@utils/log';

// @todo: 文章存 ali oss

const md = MarkdownIt({
    highlight(str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return (
                    '<pre class="hljs"><code>' +
                    // Deprecated as of 10.7.0. highlight(lang, code, ...args) has been deprecated.
                    // Deprecated as of 10.7.0. Please use highlight(code, options) instead.
                    // https://github.com/highlightjs/highlight.js/issues/2277
                    // hljs.highlight(lang, str, true).value + '</code></pre>';
                    hljs.highlight(str, {
                        language: lang,
                        ignoreIllegals: true,
                    }).value +
                    '</code></pre>'
                );
            } catch (error) {
                log.error(error);
            }
        }
        return (
            '<pre class="hljs"><code>' +
            md.utils.escapeHtml(str) +
            '</code></pre>'
        );
    },
});

const router = new Router({
    prefix: '/api/v1',
});

/**
 * 创建文章
 */
router.post('/article', userAuthMiddleware, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new ArticleValidator().validate(ctx);

    // 创建文章
    const [err] = await ArticleDao.create(v);
    if (!err) {
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.success('创建文章成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

/**
 * 删除文章
 */
router.delete('/article/:id', userAuthMiddleware, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx);

    // 获取文章ID参数
    const id = v.get('path.id');
    // 删除文章
    const [err] = await ArticleDao.destroy(id);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.success('删除文章成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

/**
 * 更新文章
 */
router.put('/article/:id', userAuthMiddleware, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx);

    // 获取文章ID参数
    const id = v.get('path.id');
    // 更新文章
    const [err] = await ArticleDao.update(id, v);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.success('更新文章成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

/**
 * 获取文章列表
 */
router.get('/article', async ctx => {
    // @todo: 文章缓存
    // 没有缓存，则读取数据库
    const [err, data] = await ArticleDao.list(ctx.query);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

/**
 * 查询文章详情
 */
router.get('/article/:id', async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx);
    // 获取文章ID参数
    const id = v.get('path.id');
    // 查询文章
    const [err, data] = await ArticleDao.detail(id, ctx.query);
    if (!err) {
        // 获取关联此文章的评论列表
        const [commentError, commentData] = await CommentDao.targetComment({
            article_id: id,
        });

        if (!commentError) {
            data.article_comment = commentData;
        }

        if (ctx.query.is_markdown) {
            data.content = md.render(data.content);
        }

        // 更新文章浏览
        await ArticleDao.updateBrowse(id, ++data.browse);
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

export default router;
