/**
 * Link model module.
 * @Link 友链数据模型
 * @module model/Link
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const LinkSchema = new Schema({
    // 网站名称
    title: { type: String, require: true, validate: /\S+/ },

    // 简介
    desc: { type: String, require: true },

    // 图标
    logo: { type: String },

    // 链接
    url: { type: String },

    // 是否置顶
    isTop: { type: Boolean, default: false },

    // 是否停更
    isStop: { type: Boolean, default: false },

    // 创建时间
    createTime: { type: Number, default: Date.now },
    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

module.exports = mongoose.model('Link', LinkSchema);
