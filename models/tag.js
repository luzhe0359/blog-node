/**
 * Tag model module.
 * @Tag 标签数据模型
 * @module model/Tag
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    // 名称
    name: { type: String, require: true, validate: /\S+/ },

    // 描述
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

module.exports = mongoose.model('Tag', TagSchema);
