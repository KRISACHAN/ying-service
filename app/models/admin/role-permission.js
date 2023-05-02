import { sequelize } from '@utils/db';
import { Model, DataTypes } from 'sequelize';
import { RoleModel } from './role';
import { PermissionModel } from './permission';

// 定义角色权限模型
export class RolePermissionModel extends Model {}

// 初始角色权限模型
RolePermissionModel.init(
    {
        id: {
            type: DataTypes.INTEGER, // 数据类型为整型
            allowNull: false, // 不允许为空
            primaryKey: true, // 设置为主键
            autoIncrement: true, // 自增
        },
    },
    {
        sequelize,
        modelName: 'role_permission',
        tableName: 'role_permission',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);

RolePermissionModel.belongsTo(RoleModel, {
    foreignKey: 'role_id',
    targetKey: 'id',
});
RoleModel.hasMany(RolePermissionModel, {
    foreignKey: 'role_id',
    targetKey: 'id',
});

RolePermissionModel.belongsTo(PermissionModel, {
    foreignKey: 'permission_id',
    targetKey: 'id',
});
PermissionModel.hasMany(RolePermissionModel, {
    foreignKey: 'permission_id',
    targetKey: 'id',
});
