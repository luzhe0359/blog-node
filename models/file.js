/**
 * Image model module.
 * @file 图片数据模型
 * @module model/image
 * @author lzzz
 */
const autoIncrement = require('mongoose-auto-increment');
const { mongoose } = require('../utils/mongoose')
const Schema = mongoose.Schema;

const FileSchema = new Schema({
    // 上传名称
    name: { type: String, require: true },

    // 路径
    url: { type: String, require: true },

    // 大小
    size: { type: String, require: true },

    // 类型
    type: { type: String },

    // 创建时间
    createTime: { type: Number, default: Date.now },

    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

// 自增ID插件配置
autoIncrement.initialize(mongoose.connection)
FileSchema.plugin(autoIncrement.plugin, {
    model: 'File',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

// 4.将文档结构发布为模型
module.exports = mongoose.model('File', FileSchema);
