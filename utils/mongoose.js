const mongoose = require('mongoose');
const { DB_URL } = require('../config/config')

// 去除弃用警告
mongoose.set('useFindAndModify', false)

// mongoose Promise
mongoose.Promise = global.Promise

// mongoose
exports.mongoose = mongoose

// connect
exports.connect = async () => {
    try {
        // 连接数据库
        await mongoose.connect(DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            promiseLibrary: global.Promise
        })
        mongoose.connection.on('connected', () => {
            console.log('数据库连接成功')
        })
            .on('disconnected', () => {
                console.log('数据库断开')
            })
            .on('error', error => {
                console.log('数据库连接异常', error)
            })
        // 返回实例
        return mongoose
    } catch (error) {
        console.log(error)
    }
}