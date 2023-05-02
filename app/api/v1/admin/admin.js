// 管理员的 API 接口
import Router from 'koa-router';
import { pick } from 'lodash';
import { resolve } from '@utils/resolve';
import { AdminDao } from '@dao/admin/admin';
import { RoleDao } from '@dao/admin/role';
import { AdminRoleDao } from '@dao/admin/admin-role';
import { RolePermissionDao } from '@dao/admin/role-permission';
import { isSuperAdmin } from '@app/utils/constants';
import { BAD_REQUEST, FORBIDDEN } from '@utils/http-errors';
import authMiddleware from '@app/middlewares/auth';
import loginMiddleware from '@app/middlewares/login';
import registerValidatorMiddleware from '@app/middlewares/regsiter-validator';
import loginValidatorMiddleware from '@app/middlewares/login-validator';

const router = new Router({
    prefix: '/api/v1/admin',
});

// 注册
router.post('/register', registerValidatorMiddleware, async ctx => {
    const { email, password1, password2, username } = ctx.request.body;
    if (password1 !== password2) {
        throw BAD_REQUEST('两次输入的密码不一致，请重新输入');
    }
    // 创建管理员
    const result = await AdminDao.create({
        email,
        password: password2,
        username,
    });
    if (!result) {
        return;
    }
    // 返回结果
    ctx.response.status = 200;
    ctx.body = resolve.json(ctx.validate, '创建管理员成功');
});

// 登录
router.post('/login', loginValidatorMiddleware, loginMiddleware, async ctx => {
    ctx.response.status = 200;
    ctx.body = resolve.json(ctx.loginData);
});

// 删除管理员
router.delete('/:id', authMiddleware, async ctx => {
    const { role } = ctx.admin;
    if (!isSuperAdmin(role.name)) {
        throw FORBIDDEN('无权限删除管理员');
    }
    const { id } = ctx.params;
    if (!id) {
        throw BAD_REQUEST('未找到相关管理员');
    }

    const deleted = await AdminDao.delete({
        id,
    });

    if (!deleted) {
        return;
    }
    // 返回结果
    ctx.response.status = 200;
    ctx.body = resolve.json({
        message: '删除成功',
    });
});

// 修改管理员信息
router.put('/:id', authMiddleware, async ctx => {
    const { id } = ctx.params; // 要修改的管理员ID
    const { email, password, username } = ctx.request.body; // 请求体中的新信息
    const currentAdminId = ctx.admin.admin.id; // 当前操作的管理员ID
    const currentAdminRoleName = ctx.admin.role.name; // 当前操作的管理员角色名称

    // 检查是否有权限修改
    // 判断当前用户是否为超级管理员或者修改的是自己的信息
    if (!isSuperAdmin(currentAdminRoleName) && currentAdminId !== id) {
        throw FORBIDDEN('无权限修改管理员信息');
    }

    // 调用 AdminDao 的 update 方法更新管理员信息
    const success = await AdminDao.update(id, {
        email,
        password,
        username,
    });

    if (!success) {
        return;
    }
    ctx.response.status = 200;
    ctx.body = resolve.json({
        message: '管理员信息更新成功',
    });
});

// 查询管理员列表
router.get('/', authMiddleware, async ctx => {
    const currentAdminRoleName = ctx.admin.role.name; // 当前操作的管理员角色名称

    // 检查是否为超级管理员
    if (!isSuperAdmin(currentAdminRoleName)) {
        throw FORBIDDEN('只有超级管理员可以查询管理员列表');
    }

    const { pageNum, pageSize } = ctx.query; // 从查询参数中获取分页信息
    const result = await AdminDao.query({
        pageNum: parseInt(pageNum, 10) || 1,
        pageSize: parseInt(pageSize, 10) || 10,
    });

    ctx.response.status = 200;
    ctx.body = resolve.json(result);
});

// 查询管理员信息
router.get('/:id', authMiddleware, async ctx => {
    const { id } = ctx.params; // 要查询的管理员ID
    const currentAdminId = ctx.admin.admin.id; // 当前操作的管理员ID
    const currentAdminRoleName = ctx.admin.role.name; // 当前操作的管理员角色名称

    // 检查是否有权限查看
    // 判断当前用户是否为超级管理员或者查看的是自己的信息
    if (!isSuperAdmin(currentAdminRoleName) && currentAdminId !== id) {
        throw FORBIDDEN('无权限查看管理员信息');
    }

    // 调用 AdminDao 的 search 方法查询管理员信息
    const adminInfo = await AdminDao.search({ id });

    // 调用 AdminRoleDao 的 searchByAdmin 方法获取管理员角色信息
    const adminRole = await AdminRoleDao.searchByAdmin(id);

    // 调用 RoleDao 的 search 方法获取角色信息
    const roleInfo = await RoleDao.search(adminRole.role_id);

    // 调用 RolePermissionDao 的 searchByRole 方法获取角色权限信息
    const rolePermissions = await RolePermissionDao.searchByRole(
        adminRole.role_id,
    );

    // 组装返回数据
    const responseData = {
        adminInfo: pick(adminInfo, ['id', 'username', 'email']),
        roleInfo: pick(roleInfo, ['id', 'name', 'description']),
        rolePermissions: rolePermissions.map(permission =>
            pick(permission, ['id', 'name', 'description']),
        ),
    };

    ctx.response.status = 200;
    ctx.body = resolve.json(responseData);
});

export default router;
