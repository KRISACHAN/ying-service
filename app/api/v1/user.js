// 用户的路由 API 接口
import Router from 'koa-router';
import {
    RegisterValidator,
    PositiveIdParamsValidator,
    UserLoginValidator,
} from '@validators/user';
import { UserDao } from '@dao/user';
import {
    AUTH_MAP,
    userAuthMiddleware,
    adminAuthMiddleware,
} from '@middlewares/auth';
import { resolve } from '@utils/resolve';
import { generateToken } from '@utils/helpers';

const router = new Router({
    prefix: '/api/v1/user',
});
// 用户登录
const userLogin = async params => {
    const { email, password } = params;
    // 验证账号密码是否正确
    const [err, user] = await UserDao.verify(email, password);
    if (!err) {
        return [null, generateToken(user.id, AUTH_MAP.USER), user.id];
    } else {
        return [err, null];
    }
};

// 用户注册
router.post('/register', async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new RegisterValidator().validate(ctx);
    const email = v.get('body.email');
    const password = v.get('body.password2');

    // 创建用户
    const [err, data] = await UserDao.create({
        password,
        email,
        username: v.get('body.username'),
    });

    if (!err) {
        const [errToken, token, id] = await userLogin({
            email,
            password,
        });
        if (!errToken) {
            data.token = token;
            data.id = id;
        }
        // 返回结果
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 管理登录
router.post('/login', async ctx => {
    const v = await new UserLoginValidator().validate(ctx);

    let [err, token, id] = await userLogin({
        email: v.get('body.email'),
        password: v.get('body.password'),
    });

    if (!err) {
        let [err, data] = await UserDao.detail(id);
        if (!err) {
            data.setDataValue('token', token);
            ctx.response.status = 200;
            ctx.body = resolve.json(data);
        }
    } else {
        ctx.body = resolve.fail(err, err.msg);
    }
});

// 获取用户信息
router.get('/auth', userAuthMiddleware, async ctx => {
    // 获取用户ID
    const id = ctx.auth.uid;

    // 查询用户信息
    let [err, data] = await UserDao.detail(id, 1);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.response.status = 401;
        ctx.body = resolve.fail(err, err.msg);
    }
});

// 获取用户列表
// 需要管理员及以上才能操作
router.get('/list', adminAuthMiddleware, async ctx => {
    // 查询用户信息
    let [err, data] = await UserDao.list(ctx.query);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 获取用户信息
// 需要管理员及以上才能操作
router.get('/detail/:id', userAuthMiddleware, async ctx => {
    // 获取用户ID
    const v = await new PositiveIdParamsValidator().validate(ctx);
    const id = v.get('path.id');
    // 查询用户信息
    let [err, data] = await UserDao.detail(id);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.json(data);
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 获取用户列表
// 需要管理员及以上才能操作
router.delete('/delete/:id', adminAuthMiddleware, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx);

    // 获取用户ID参数
    const id = v.get('path.id');
    // 删除用户
    const [err] = await UserDao.destroy(id);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.success('删除用户成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

// 获取更新用户信息
// 需要管理员及以上才能操作
router.put('/update/:id', adminAuthMiddleware, async ctx => {
    // 通过验证器校验参数是否通过
    const v = await new PositiveIdParamsValidator().validate(ctx);

    // 获取用户ID参数
    const id = v.get('path.id');
    // 删除用户
    const [err] = await UserDao.update(id, v);
    if (!err) {
        ctx.response.status = 200;
        ctx.body = resolve.success('更新用户成功');
    } else {
        ctx.body = resolve.fail(err);
    }
});

export default router;
