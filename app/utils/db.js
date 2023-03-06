import Sequelize from 'sequelize';
import { get } from 'lodash';
import log from '@utils/log';

export const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        logging: false,
        timezone: '+08:00',
        define: {
            // create_time && update_time
            timestamps: true,
            // delete_time
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
            // 把驼峰命名转换为下划线
            underscored: true,
            scopes: {
                bh: {
                    attributes: {
                        exclude: [
                            'password',
                            'updated_at',
                            'deleted_at',
                            'created_at',
                        ],
                    },
                },
                iv: {
                    attributes: {
                        exclude: [
                            'content',
                            'password',
                            'updated_at',
                            'deleted_at',
                        ],
                    },
                },
            },
        },
    },
);

// 创建模型
sequelize.sync({ force: false });

sequelize
    .authenticate()
    .then(() => {
        log.verbose('');
        log.verbose('        DB running message');
        log.verbose(
            `        - Netword: ${process.env.DB_HOST}:${process.env.DB_PORT}`,
        );
        log.verbose('        - Status: db connect success');
        log.verbose('');
    })
    .catch(error => {
        log.error('');
        log.error('        DB running message:');
        log.error(
            `        - Netword: ${process.env.DB_HOST}:${process.env.DB_PORT}`,
        );
        log.error('        - Status: db connect fail');
        log.error(`        - Message: ${get(error, 'message', error)}`);
        log.error('');
    });
