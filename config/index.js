/**
 * 全局配置
 */
const { CRYPTO_KEY, CRYPTO_IV, ACCESS_KEY_ID, ACCESS_KEY_SECRET, NODEMAILER_AUTH_PASS } = require('./secret')

module.exports = {
    DB_URL: 'mongodb://127.0.0.1:27017/lzzzblog?authSource=admin', // mongoose 链接地址
    OSS_BASE_URL: 'https://oss.zugelu.com/',
    CRYPTO_KEY, // 16位加密密钥 AES的密钥长度有 128、192、256位，3种长度
    CRYPTO_IV, // 16位偏移量, 可以与秘钥相同
    ACCESS_KEY_ID,
    ACCESS_KEY_SECRET,
    NODEMAILER_AUTH_PASS,
    TOKEN_TIME: '100y', // token失效时间
    CODE: { // 业务状态码
        OK: 2000, // 请求成功
        USER_ERR: 2002, // 用户名/密码 错误
        ROLE_ERR: 2003, // 角色 有毛病
        TOKEN_INVALID: 4001, // TOKEN 无效
        TOKEN_EXPIRED: 4003, // TOKEN 过期
        SESSION_ERR: 6001, // 会话失效
        NOT_LOGIN: 6002, // 未登录
        LOGIN_ERR: 6003, // 异地登录
        OTHER_ERR: 6006 // 其他错误
    },
    REDIS: { // redis
        PORT: 6379, // 端口号
        HOST: '127.0.0.1', // 服务器IP
        TOKEN_TIME: 259200 // 会话失效时间(单位：秒)3天/259200秒 100年/3153600000秒
    },
    ROUTE_WHITE_LIST: [ // 路由白名单, 除了这几个地址, 其他的URL都需要jwt验证
        '/api/',
        '/api/user/login',
        '/api/user/add',
    ],
    CORS_WHITE_LIST: [ // 跨域白名单
        'http://127.0.0.1:8081',
        'http://localhost:8081',
        'http://127.0.0.1:8082',
        'http://localhost:8082',
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'http://127.0.0.1:3001',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5000',
        'http://localhost:5000',
        'https://www.zugelu.com',
        'https://zugelu.com',
        /\.zugelu\.com$/
    ]
}