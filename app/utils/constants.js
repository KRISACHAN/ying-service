import { eq } from 'lodash';

export const adminMap = Object.freeze({
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
});

export const isSuperAdmin = role => eq(role, adminMap.SUPER_ADMIN);
