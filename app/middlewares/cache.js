import Redis from 'ioredis';
import LRUCache from 'lru-cache';

class CacheStore {
    constructor() {
        this.stores = [];
    }
    add(store) {
        this.stores.push(store);
        return this;
    }
    async set(key, value) {
        for (const store of this.stores) {
            await store.set(key, value);
        }
    }
    async get(key) {
        for (const store of this.stores) {
            const value = await store.get(key);
            if (value !== undefined) return value;
        }
    }
}
class MemoryStore {
    constructor() {
        this.cache = new LRUCache({
            max: 100,
            //一般来说越上层的过期时间越短
            ttl: 1000, //设置过期时间
        });
    }
    async set(key, value) {
        this.cache.set(key, value);
    }
    async get(key) {
        return this.cache.get(key);
    }
}

class RedisStore {
    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        });
    }
    async set(key, value) {
        await this.client.set(key, JSON.stringify(value));
    }
    async get(key) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : undefined;
    }
}
//创建一个缓存实例
const cacheStore = new CacheStore();
//添一些缓存层
cacheStore.add(new MemoryStore());
cacheStore.add(new RedisStore());

const cacheMiddleware = async (ctx, next) => {
    ctx.cache = cacheStore;
    await next();
};
export default cacheMiddleware;
