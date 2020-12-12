
const redis = require('redis')
const chalk = require('chalk')
const { REDIS, CODE } = require('../config/config')


//  创建连接  第一个参数是端口  第二个参数 主机
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

// 设置 redis
function set (key, val) {
    redisCli.set(key, val, (err, reply) => {
        try {
            reply &&
                // 设置过期时间
                redisCli.expire(key, REDIS.TOKEN_TIME, (err, reply) => {
                    console.log(chalk.green('保存token', key, val))
                })
        } catch (error) {
            // throw new Error(error)
        }
    })
}

// 获取 redis
function get (key) {
    return redisCli.get(key)
}

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

// 获取 token(请求头中获取)
function getToken (headers) {
    if (headers && headers.authorization) {
        var authorization = headers.authorization
        var part = authorization.split(' ')
        if (part.length === 2) {
            return part[1]
        } else {
            return null
        }
    } else {
        return null
    }
}

// 刷新 token
function refreshToken (req, res, next) {
    let token = getToken(req.headers)
    // 没有token，则不去redis里查，jwt中间件会自动校验是否在白名单中
    if (!token) {
        return next()
    }
    redisCli.get(token, (err, reply) => {
        if (reply) {
            // token 在redis中存在，更新过期时间
            redisCli.expire(token, REDIS.TOKEN_TIME, function (err, reply2) {
                if (err) return false
                next()
            })
        } else {
            return res.status(200).json({
                code: CODE.SESSION_ERR,
                msg: 'Session invalid, please log in again ...'
            });
        }
    })
}


module.exports = {
    set,
    get,
    remove,
    getToken,
    refreshToken,
}