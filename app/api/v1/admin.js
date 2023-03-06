// 管理员的路由 API 接口
import Router from 'koa-router';
import { RegisterValidator, AdminLoginValidator } from '@validators/admin';
import { AdminDao } from '@dao/admin';
import { AUTH_MAP, adminAuthMiddleware } from '@middlewares/auth';
import { resolve } from '@utils/resolve';
import { generateToken } from '@utils/helpers';

const router = new Router({
    prefix: '/api/v1/admin',
});

// 管理员注册
router.post('/register', async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new RegisterValidator().validate(ctx);

    // 创建管理员
    const [err, data] = await AdminDao.create({
        email: v.get('body.email'),
        password: v.get('body.password2'),
        nickname: v.get('body.nickname'),
    });

    if (!err) {
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

const adminLogin = async params => {
    const { email, password } = params;
    // 验证账号密码是否正确
    const [err, admin] = await AdminDao.verify(email, password);
    if (!err) {
        return [null, generateToken(admin.id, AUTH_MAP.ADMIN)];
    } else {
        return [err, null];
    }
};

// 管理登录
router.post('/login', async ctx => {
    const v = await new AdminLoginValidator().validate(ctx);

    const [err, token] = await adminLogin({
        email: v.get('body.email'),
        password: v.get('body.password'),
    });

    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.json({ token });
    } else {
        ctx.body = resolve.fail(err, err.msg);
    }
});

// 获取用户信息
router.get('/auth', adminAuthMiddleware, async ctx => {
    // 获取用户ID
    const id = ctx.auth.uid;

    // 查询用户信息
    let [err, data] = await AdminDao.detail(id);

    if (!err) {
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

export default router;
