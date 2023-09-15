const util = require('util');
const redis = require('redis');
const mongoose = require('mongoose');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
    console.log('exec Executing =======');
    
    const key = JSON.stringify({ ...this.getQuery(), collection: this.mongooseCollection.name });

    /** check if value of key is present in redis */
    const cacheValue = await client.get(key);

    /** if key present in redis return that */
    if (cacheValue) {
        console.log(cacheValue);
        return JSON.parse(cacheValue);
    }

    /** if not then run query & store result in redis */
    const result = await exec.apply(this, arguments);
    console.log('result==>',result);
    return result;
}