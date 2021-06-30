/**
 * Category model module.
 * @Category 分类数据模型
 * @module model/Category
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    // 分类名称
    name: { type: String, require: true, validate: /\S+/ },

    // 分类描述
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

module.exports = mongoose.model('Category', CategorySchema);
