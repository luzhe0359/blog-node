/**
 * User model module.
 * @User 用户数据模型
 * @module model/user
 * @author lzzz
 */
// 自增ID
const autoIncrement = require('mongoose-auto-increment');
// 1.引包
const { mongoose } = require('../middleware/mongoose')

// 2.拿到schema
const Schema = mongoose.Schema;

// 3.设计集合结构（用户表、表结构）
const userSchema = new Schema({
    // 姓名 6-12位,包含数字、字母、特殊字符
    username: { type: String, require: true, validate: /\S+/ },

    // 密码 8-16位，aes加密
    password: { type: String, require: true },

    // 角色 admin/editor
    role: { type: Array, require: true, default: ['editor'] },

    // 昵称 2-6位
    nickname: { type: String, default: '暂无昵称' },

    // 邮箱
    email: { type: String },

    // 年龄 正常不超过120岁
    age: { type: Number, min: 0, max: 120 },

    // 性别 | 0:女 | 1:男 | -1:保密*
    gender: { type: Number, enum: [0, 1, -1], default: -1 },

    // 头像
    avatar: { type: String, default: '/images/default_avatar.jpeg' },

    // 个人简介
    about: { type: String, default: '这个人很懒，什么都没留下~' },

    // 权限 | 0:没有权限限制 | 1:不可以评论 | 2:不可以登录
    status: { type: Number, enum: [0, 1, 2], default: 0 },

    // 创建时间
    createTime: { type: Number, default: Date.now },

    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

// 自增ID插件配置
autoIncrement.initialize(mongoose.connection)
userSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

// 4.将文档结构发布为模型
module.exports = mongoose.model('User', userSchema);
