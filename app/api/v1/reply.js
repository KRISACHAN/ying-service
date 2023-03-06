import Router from 'koa-router';
import { ReplyDao } from '@dao/reply';
import {
    ReplyValidator,
    PositiveArticleIdParamsValidator,
} from '@validators/reply';
import { userAuthMiddleware } from '@middlewares/auth';
import { resolve } from '@utils/resolve';

// @todo: 文章存 ali oss

const router = new Router({
    prefix: '/api/v1',
});

// 创建回复
router.post('/reply', async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new ReplyValidator().validate(ctx);
    // 创建回复
    const [err] = await ReplyDao.create(v);

    if (!err) {
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.success('回复成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 删除回复
router.delete('/reply/:id', userAuthMiddleware, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveArticleIdParamsValidator().validate(ctx);

    // 获取分类ID参数
    const id = v.get('path.id');
    const [err] = await ReplyDao.destroy(id);
    if (!err) {
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.success('删除回复回复成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 修改回复
router.put('/reply/:id', userAuthMiddleware, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveArticleIdParamsValidator().validate(ctx);

    // 获取分类ID参数
    const id = v.get('path.id');
    const [err] = await ReplyDao.update(id, v);
    if (!err) {
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.success('更新回复成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 获取回复列表
router.get('/reply', async ctx => {
    const [err, data] = await ReplyDao.list(ctx.query);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 获取回复详情
router.get('/reply/:id', async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveArticleIdParamsValidator().validate(ctx);

    // 获取分类ID参数
    const id = v.get('path.id');
    const [err, data] = await ReplyDao.detail(id);

    if (!err) {
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

export default router;
