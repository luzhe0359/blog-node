/**
 * 全局配置
 */
module.exports = {
    DB_URL: 'mongodb://localhost:27017/lzzzblog', // mongoose 链接地址
    CRYPTO_KEY: 'lzzzLOVEtian3344', // 16位加密密钥 AES的密钥长度有 128、192、256位，3种长度
    CRYPTO_IV: 'lzzzLOVEtian3344', // 16位偏移量, 可以与秘钥相同
    TOKEN_TIME: '1d', // token失效时间
    CODE: { // 业务状态码
        OK: 2000, // 请求成功
        ERR: 5000, // 请求失败
        NAME_ERR: 2001, // 账号已存在
        USER_ERR: 2002, // 用户名/密码 错误
        TOKEN_INVALID: 4001, // TOKEN 无效
        TOKEN_EXPIRED: 4003, // TOKEN 过期
        SESSION_ERR: 6001, // 会话失效
        LOGIN_ERR: 6003, // 异地登录
        OTHER_ERR: 6006 // 其他错误
    },
    REDIS: { // redis
        PORT: 6379, // 端口号
        HOST: '127.0.0.1', // 服务器IP
        TOKEN_TIME: 50000 // 会话失效时间
    }
}