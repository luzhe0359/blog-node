
const redis = require('redis')
const chalk = require('chalk')
const { promisify } = require("util");
const { REDIS } = require('../config/config')


//  创建连接  第一个参数是 第二个参数 
/**
 * 创建redis连接
 * @param {String} PORT 端口
 * @param {String} HOST 主机
 */
const redisCli = redis.createClient(REDIS.PORT, REDIS.HOST)

// 监听 connect
redisCli.on('connect', () => {
    console.log(chalk.green('Redis client conncted to server.'))
})
// 监听 ready
redisCli.on('ready', () => {
    console.log(chalk.green('Redis serve is Ready.'))
})
// 监听 error
redisCli.on('error', err => {
    console.error('Redis error.', err)
})

/**
 * 设置 redis
 * @param {String} key 用户_id
 * @param {String} val 加密后的token
 */
function set (key, val, time) {
    redisCli.set(key, val, (err, reply) => {
        try {
            if (!err && reply) {
                // 设置过期时间(单位：秒)
                redisCli.expire(key, REDIS.TOKEN_TIME, (err, reply) => {
                    console.log(chalk.green('保存', key, time || REDIS.TOKEN_TIME, val))
                })
            }
        } catch (error) {
            throw new Error(error)
        }
    })
}

/**
 * 判断是否存在 redis
 * @param {String} key redis的key
 */
function get (key) {
    const getAsync = promisify(redisCli.get).bind(redisCli);
    return getAsync(key)
}

/**
 * 移除 redis
 * @param {String} key 用户_id
 */
async function remove (key) {
    // 删除成功，返回1，否则返回0(对于不存在的键进行删除操作，同样返回0)
    return new Promise((resolve, reject) => {
        redisCli.del(key, (err, reply) => {
            if (err) {
                reject(err)
            }
            resolve(reply)
        })
    })
}

module.exports = {
    set,
    get,
    remove,
    redisCli
}