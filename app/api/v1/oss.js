import Router from 'koa-router';
import { ossService } from '@services/oss';
import { resolve } from '@utils/resolve';
import { adminAuthMiddleware } from '@middlewares/auth';

const router = new Router({
    prefix: '/api/v1/oss',
});

router.post('/upload', adminAuthMiddleware, async ctx => {
    const body = ctx.request.body;
    const { name, resource, tagging } = body;
    if (!name) {
        throw new global.errs.ParameterException('上传资源必须要有名字');
    }
    if (!resource) {
        throw new global.errs.ParameterException('不可上传空资源');
    }
    const headers = {
        // 指定Object的存储类型。
        'x-oss-storage-class': 'Standard',
    };
    if (tagging) {
        headers['x-oss-tagging'] = tagging;
    }
    const res = await ossService.upload({
        name,
        resource,
        headers,
    });
    ctx.body = resolve.json(res);
});

export default router;
