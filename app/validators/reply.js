import { Rule, LinValidator } from '@utils/lin-validator-v2';

export class ReplyValidator extends LinValidator {
    constructor() {
        super();

        this.content = [new Rule('isLength', 'content 不能为空', { min: 1 })];
        this.comment_id = [
            new Rule('isLength', 'comment_id 不能为空', { min: 1 }),
        ];
    }
}

export class PositiveArticleIdParamsValidator extends LinValidator {
    constructor() {
        super();
        this.id = [new Rule('isInt', '评论ID需要正整数', { min: 1 })];
    }
}
