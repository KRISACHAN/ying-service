import { sequelize } from '@utils/db';
import { Model, DataTypes } from 'sequelize';
import { RoleModel } from './role';
import { AdminModel } from './admin';

// 定义管理员角色模型
export class AdminRoleModel extends Model {}

// 初始管理员角色模型
AdminRoleModel.init(
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
        modelName: 'admin_role',
        tableName: 'admin_role',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
);

AdminRoleModel.belongsTo(AdminModel, {
    foreignKey: 'admin_id',
    targetKey: 'id',
});
AdminModel.hasMany(AdminRoleModel, { foreignKey: 'admin_id', targetKey: 'id' });

AdminRoleModel.belongsTo(RoleModel, { foreignKey: 'role_id', targetKey: 'id' });
RoleModel.hasMany(AdminRoleModel, { foreignKey: 'role_id', targetKey: 'id' });
