const jwt = require('jsonwebtoken');
const { REDIS, CODE, CRYPTO_KEY, TOKEN_TIME } = require('../config/config')
const { redisCli } = require('./redis')


/**
 * jwt加密
 * @param {Object} userInfo 需要加密的用户信息
 * @return {String} 加密后的token
 */
const jwtEncrypt = (userInfo) => {
    return jwt.sign(
        userInfo,
        CRYPTO_KEY, // 秘钥
        { expiresIn: TOKEN_TIME } // 过期时间
    )
}

/**
 * jwt解密
 * @param {String} token 用户的token
 * @return {String} 用户信息 || null
 */
const jwtDecrypt = (token) => {
    return jwt.verify(token, CRYPTO_KEY)
}

/**
 * 请求头中获取token
 * @param {Object} headers 请求头
 * @return {String} token 
 */
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

/**
 * 请求头中获取用户信息
 * @param {Object} headers 请求头
 * @return {String} userInfo 
 */
function getUserInfo (headers) {
    const token = getToken(headers)
    return token ? jwtDecrypt(token) : null
}

// 刷新 token
function refreshToken (req, res, next) {
    let token = getToken(req.headers)
    // 没有token，则不去redis里查，jwt中间件会自动校验是否在白名单中
    if (!token) {
        return next()
    }
    const userInfo = jwtDecrypt(token)
    redisCli.get(userInfo._id, (err, reply) => {
        if (reply && reply === token) { // headers中token，redis中token相同
            // token 在redis中存在，更新过期时间
            redisCli.expire(userInfo._id, REDIS.TOKEN_TIME, function (err, reply2) {
                if (err) return false
                next()
            })
        } else if (reply && reply !== token) { // headers中token，redis中token不同
            return res.status(200).json({
                code: CODE.LOGIN_ERR,
                msg: 'Login in other places, please login again ...'
            });
        } else {
            return res.status(200).json({
                code: CODE.SESSION_ERR,
                msg: 'Session invalid, please login again ...'
            });
        }
    })
}


module.exports = {
    jwtEncrypt,
    jwtDecrypt,
    getToken,
    getUserInfo,
    refreshToken
}