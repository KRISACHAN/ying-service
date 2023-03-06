import fs from 'fs';
import path from 'path';
import os from 'os';
import { eq } from 'lodash';
import jwt from 'jsonwebtoken';

// 分类列表创建树结构
export function handleTree(list) {
    // 对源数据深度克隆
    let cloneData = JSON.parse(JSON.stringify(list));
    //循环所有项
    return cloneData.filter(father => {
        let branchArr = cloneData.filter(child => {
            //返回每一项的子级数组
            return father.id === child.parent_id;
        });
        if (branchArr.length > 0) {
            //如果存在子级，则给父级添加一个children属性，并赋值
            father.sub_comments = branchArr;
        }
        //返回第一层
        return father.parent_id === 0;
    });
}

// 数组去重
export function unique(arr) {
    // eslint-disable-next-line no-undef
    return [...new Set(arr)];
}

// 检测是否是数组
export function isArray(arr) {
    return Array.isArray(arr);
}

export function extractQuery(query, like) {
    let filter = {};
    if (!query) {
        return filter;
    }

    for (let key in query) {
        const value = query[key];
        if (value) {
            if (query[key] !== like) {
                filter[key] = value;
            }
        }
    }
    return filter;
}

export function getIP() {
    let IPv4 = '127.0.0.1';
    if (os?.networkInterfaces()?.en0) {
        os.networkInterfaces().en0.forEach(en => {
            if (eq(en.family, 'IPv4')) {
                IPv4 = en.address;
            }
        });
    }
    return IPv4;
}

export const findMembers = function (
    instance,
    { prefix, specifiedType, filter },
) {
    // 递归函数
    function _find(instance) {
        //基线条件（跳出递归）
        if (instance.__proto__ === null) return [];

        // eslint-disable-next-line no-undef
        let names = Reflect.ownKeys(instance);
        names = names.filter(name => {
            // 过滤掉不满足条件的属性或方法名
            return _shouldKeep(name);
        });

        return [...names, ..._find(instance.__proto__)];
    }

    function _shouldKeep(value) {
        if (filter) {
            if (filter(value)) {
                return true;
            }
        }
        if (prefix) if (value.startsWith(prefix)) return true;
        if (specifiedType)
            if (instance[value] instanceof specifiedType) return true;
    }

    return _find(instance);
};

// 颁布令牌
export const generateToken = function (uid, scope) {
    const secretKey = process.env.JWT_SECRET_KEY;
    const expiresIn = process.env.JWT_EXPIRED;
    const token = jwt.sign(
        {
            uid,
            scope,
        },
        secretKey,
        {
            expiresIn: expiresIn,
        },
    );
    return token;
};

export function isFileExisted(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.R_OK);
        return true;
    } catch (error) {
        return false;
    }
}

export function mkdirPath(pathStr) {
    let projectPath = path.resolve(__dirname, '..');
    let tempDirArray = pathStr.split('\\');
    for (let i = 0; i < tempDirArray.length; i++) {
        projectPath = projectPath + '/' + tempDirArray[i];
        if (isFileExisted(projectPath)) {
            let tempstats = fs.statSync(projectPath);
            if (!tempstats.isDirectory()) {
                fs.unlinkSync(projectPath);
                fs.mkdirSync(projectPath);
            }
        } else {
            fs.mkdirSync(projectPath);
        }
    }
    return projectPath;
}
