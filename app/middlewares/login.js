import { pick } from 'lodash';
import { AdminDao } from '@dao/admin/admin';
import { RoleDao } from '@dao/admin/role';
import { AdminRoleDao } from '@dao/admin/admin-role';
import { RolePermissionDao } from '@dao/admin/role-permission';
import { PermissionDao } from '@dao/admin/permission';
import { generateToken } from '@utils/helpers';
import {
    UNAUTHORIZED,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR,
} from '@utils/http-errors';

// 登录中间件
const login = async (ctx, next) => {
    const { email, password } = ctx.request.body;
    // 验证账号密码是否正确
    const admin = await AdminDao.verify({ email, password });
    if (!admin) {
        throw UNAUTHORIZED('账号不存在或密码错误');
    }
    const uid = admin.id;
    // 根据 admin 的 id 获取 admin_role 信息
    const adminRole = await AdminRoleDao.searchByAdmin(uid);
    if (!adminRole) {
        throw INTERNAL_SERVER_ERROR('获取管理员角色失败');
    }
    // 根据 admin_role 的 role_id 获取 role 信息
    const role = await RoleDao.search(adminRole?.role_id);
    if (!role) {
        throw NOT_FOUND('角色不存在');
    }
    // 根据 role 的 id 获取 role_permission 信息
    const rolePermission = await RolePermissionDao.searchByRole(role?.id);
    if (!rolePermission) {
        throw INTERNAL_SERVER_ERROR('获取角色权限失败');
    }
    // 根据 permission 的 id 获取 permission 信息；
    const permission = await PermissionDao.search(
        rolePermission?.permission_id,
    );
    if (!permission) {
        throw NOT_FOUND('权限不存在');
    }
    const token = generateToken(admin.id, permission.id);
    ctx.loginData = {
        token,
        admin_info: {
            admin: pick(admin, ['id', 'username', 'email']),
            role: pick(role, ['id', 'name', 'description']),
        },
    };
    await next();
};

export default login;
