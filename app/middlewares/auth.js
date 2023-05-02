import jwt from 'jsonwebtoken';
import parseBearerToken from 'parse-bearer-token';
import { pick } from 'lodash';
import { AdminDao } from '@dao/admin/admin';
import { RoleDao } from '@dao/admin/role';
import { AdminRoleDao } from '@dao/admin/admin-role';
import { RolePermissionDao } from '@dao/admin/role-permission';
import { PermissionDao } from '@dao/admin/permission';
import {
    FORBIDDEN,
    NOT_FOUND,
    UNAUTHORIZED,
    INTERNAL_SERVER_ERROR,
} from '@utils/http-errors';

// 定义鉴权中间件
const auth = async (ctx, next) => {
    // 首先从请求头中获取 Authorization 字段，如果不存在则抛出未登录异常；
    // 从请求头中获取 token
    const parsedToken = parseBearerToken(ctx.request);
    // 没有 token 值
    if (!parsedToken) {
        throw UNAUTHORIZED('未登录，请先登录');
    }

    // 从 token 中获取 uid 和 scope；
    let uid;
    let scope;
    try {
        const tokenData = jwt.verify(parsedToken, process.env.JWT_SECRET_KEY);
        uid = tokenData.uid;
        scope = tokenData.scope;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw UNAUTHORIZED('token已过期，请重新登录');
        }
        throw FORBIDDEN(error.message || '权限不足');
    }
    // 根据 uid 获取 admin 信息，如果用户不存在则抛出未授权异常；
    const admin = await AdminDao.search({ id: uid });
    if (!admin || !admin.status) {
        throw NOT_FOUND('管理员不存在');
    }
    // 根据 admin 的 id 获取 admin_role 信息，如果用户没有角色则抛出未授权异常；
    const adminRole = await AdminRoleDao.searchByAdmin(uid);
    if (!adminRole) {
        INTERNAL_SERVER_ERROR('获取管理员角色失败');
    }
    // 根据 admin_role 的 role_id 获取 role 信息，如果角色不存在则抛出未授权异常；
    const role = await RoleDao.search(adminRole.role_id);
    if (!role) {
        throw NOT_FOUND('角色不存在');
    }
    // 根据 role 的 id 获取 role_permission 信息，如果角色没有权限则抛出未授权异常；
    const rolePermission = await RolePermissionDao.searchByRole(
        adminRole.role_id,
    );
    if (!rolePermission) {
        INTERNAL_SERVER_ERROR('获取角色权限失败');
    }
    // 根据 permission 的 id 获取 permission 信息，如果角色没有权限则抛出未授权异常；
    const permission = await PermissionDao.search(scope);
    if (!permission) {
        throw NOT_FOUND('权限不存在');
    }
    // 根据 scope 判断用户是否有访问权限，如果没有则抛出没有权限异常；
    const hasPermission = permission.id === scope;
    if (!hasPermission) {
        throw FORBIDDEN('没有访问权限');
    }
    // 把上面的用户信息存储到 ctx.admin 中，方便之后使用；
    ctx.admin = {
        admin: pick(admin, ['id', 'username', 'email']),
        role: pick(role, ['id', 'name', 'description']),
        permission: pick(permission, ['id', 'name', 'description']),
        admin_role: pick(adminRole, ['id', 'admin_id', 'role_id']),
        role_permission: pick(rolePermission, [
            'id',
            'role_id',
            'permission_id',
        ]),
    };
    // 把 uid 和 scope 存储到 ctx.auth 中，方便之后使用；
    ctx.auth = {
        uid,
        scope,
    };
    // 执行下一个中间件。
    await next();
};

export default auth;
