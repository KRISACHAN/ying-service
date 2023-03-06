import basicAuth from 'basic-auth';
import jwt from 'jsonwebtoken';

export const AUTH_MAP = {
    USER: 8,
    ADMIN: 16,
    SPUSER_ADMIN: 32,
};

export class Auth {
    constructor(level) {
        this.level = level || 1;
        Auth.USER = AUTH_MAP.USER;
        Auth.ADMIN = AUTH_MAP.ADMIN;
        Auth.SPUSER_ADMIN = AUTH_MAP.SPUSER_ADMIN;
    }

    get m() {
        // token 检测
        // token 开发者 传递令牌
        // token body header
        // HTTP 规定 身份验证机制 HttpBasicAuth
        return async (ctx, next) => {
            const tokenToken = basicAuth(ctx.req);

            let errMsg = '无效的token';
            // 无带token
            if (!tokenToken || !tokenToken.name) {
                errMsg = '需要携带token值';
                throw new global.errs.Forbidden(errMsg);
            }

            let decode;
            try {
                decode = jwt.verify(
                    tokenToken.name,
                    process.env.JWT_SECRET_KEY,
                );
            } catch (error) {
                // token 不合法 过期
                if (error.name === 'TokenExpiredError') {
                    errMsg = 'token已过期';
                }
                throw new global.errs.Forbidden(errMsg);
            }

            if (decode.scope < this.level) {
                errMsg = '权限不足';
                throw new global.errs.Forbidden(errMsg);
            }

            ctx.auth = {
                uid: decode.uid,
                scope: decode.scope,
            };

            await next();
        };
    }
}

export const userAuthMiddleware = new Auth(AUTH_MAP.USER).m;
export const adminAuthMiddleware = new Auth(AUTH_MAP.ADMIN).m;
export const spuserAuthMiddleware = new Auth(AUTH_MAP.SPUSER_ADMIN).m;
