/**
 * Tag model module.
 * @tag 标签数据模型
 * @module model/Tag
 * @author lzzz
 */
const autoIncrement = require('mongoose-auto-increment');
const { mongoose } = require('../utils/mongoose')
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    // 标签名称
    name: { type: String, require: true },

    // 标签描述
    desc: String,

    // 图标
    icon: String,

    // 创建时间
    createTime: { type: Number, default: Date.now },

    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

// 自增ID插件配置
autoIncrement.initialize(mongoose.connection)
TagSchema.plugin(autoIncrement.plugin, {
    model: 'Tag',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

// 4.将文档结构发布为模型
module.exports = mongoose.model('Tag', TagSchema);
