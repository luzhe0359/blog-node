const mongoose = require('mongoose');
const chalk = require('chalk')
const { DB_URL } = require('../config/config')

// 去除弃用警告
mongoose.set('useFindAndModify', false)

// mongoose Promise
mongoose.Promise = global.Promise

// 连接数据库
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    promiseLibrary: global.Promise
})

//使用Connetion监听连接状态
mongoose.connection.on('connected', () => { // 连接成功
    console.log(chalk.green('MongoDB database connection was successful.'))
})
    .on('disconnected', () => { // 断开连接
        console.log(chalk.yellow('MongoDB database is disconnected'))
    })
    .on('error', error => { // 连接异常
        console.error('An abnormal connection to the MongoDB database', error)
    })

// 导出mongoose，让其他models使用
exports.mongoose = mongoose