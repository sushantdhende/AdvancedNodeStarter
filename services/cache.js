const util = require('util');
const redis = require('redis');
const mongoose = require('mongoose');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');
    
    return this;
}

mongoose.Query.prototype.exec = async function () {
    console.log('exec Executing =======');

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }
    
    const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name });

    /** check if value of key is present in redis */
    const cacheValue = await client.hget(this.hasKey, key);

    /** if key present in redis return that */
    if (cacheValue) {
        console.log('cacheValue==>',cacheValue);
        return JSON.parse(cacheValue);
    }

    /** if not then run query & store result in redis */
    const result = await exec.apply(this, arguments);
    console.log('result==>',result);
    client.hset(this.hasKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}

module.exports = {
    clearHash (hashKey) {
        client.del({ _user: hashKey})
    }
}