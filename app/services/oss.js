import OSS from 'ali-oss';
import to from 'await-to-js';
import log from '@utils/log';
import { get, pick } from 'lodash';

const ossParams = {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    secure: true,
    endpoint: process.env.OSS_ENDPOINT,
};
export const oss = new OSS(ossParams);

class OssService {
    oss = oss;
    constructor() {}
    async fetchBuckets() {
        const [err, res] = await to(this.oss.listBuckets());
        if (err) {
            log.error(err);
        }
        return get(res, 'buckets', []).map(bucket =>
            pick(bucket, ['name', 'creationDate']),
        );
    }
    async fetchList() {
        const [err, res] = await to(this.oss.list());
        if (err) {
            log.error(err);
        }
        // @todo: 由于目前域名配置有问题，导致映射关系有点混乱，后续优化
        return get(res, 'objects', [])
            .filter(obj => !!obj.size)
            .map(obj => {
                const data = pick(obj, ['url', 'size']);
                const [curKey] = data.name.split('/');
                data.url = data.url.replace(
                    `${process.env.OSS_BASE_URL}/${curKey}`,
                    `${process.env.BASE_OSS_URL}/${curKey}`,
                );
                return data;
            });
    }
    async upload({ name, resource, headers }) {
        const res = await this.oss.put(
            `/static/${name}`,
            Buffer.from(resource, 'base64'),
            {
                headers,
            },
        );
        const [curKey] = res.name.split('/');
        const resUrl = res.url.replace(
            `${process.env.OSS_BASE_URL}/${curKey}`,
            `${process.env.BASE_OSS_URL}/${curKey}`,
        );
        return {
            name: name,
            url: resUrl,
            creationDate: get(res, 'res.headers.date'),
        };
    }
    getConfig() {
        return ossParams;
    }
}
export const ossService = new OssService();
export default OssService;
