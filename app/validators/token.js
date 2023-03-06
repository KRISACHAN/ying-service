import { Rule, LinValidator } from '@utils/lin-validator-v2';

export class TokenNotEmptyValidator extends LinValidator {
    constructor() {
        super();
        this.token = [new Rule('isLength', '不允许为空', { min: 1 })];
    }
}
