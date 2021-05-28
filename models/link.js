/**
 * Link model module.
 * @Link 友链数据模型
 * @module model/Link
 * @author lzzz
 */
const autoIncrement = require('mongoose-auto-increment');
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const LinkSchema = new Schema({
    // 标题
    title: { type: String, require: true, validate: /\S+/ },

    // 简介
    desc: { type: String, require: true },

    // 图标
    logo: { type: String },

    // 链接
    url: { type: String },

    // 创建时间
    createTime: { type: Number, default: Date.now },
    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

// 自增ID插件配置
autoIncrement.initialize(mongoose.connection)
LinkSchema.plugin(autoIncrement.plugin, {
    model: 'Link',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

// 4.将文档结构发布为模型
module.exports = mongoose.model('Link', LinkSchema);
