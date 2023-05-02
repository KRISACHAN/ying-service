import fs from 'fs';
import path from 'path';
import os from 'os';
import { eq } from 'lodash';
import jwt from 'jsonwebtoken';

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
