import Router from 'koa-router';

const router = new Router({
    prefix: '',
});

router.all('/api/health', async ctx => {
    ctx.body = 'hello world';
});

export default router;
