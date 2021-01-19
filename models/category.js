/**
 * Category model module.
 * @Category 分类数据模型
 * @module model/Category
 * @author lzzz
 */
const autoIncrement = require('mongoose-auto-increment');
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

// 自增ID插件配置
autoIncrement.initialize(mongoose.connection)
CategorySchema.plugin(autoIncrement.plugin, {
    model: 'Category',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

// 4.将文档结构发布为模型
module.exports = mongoose.model('Category', CategorySchema);
