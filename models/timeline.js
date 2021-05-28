/**
 * Timeline model module.
 * @Timeline 文章数据模型
 * @module model/Timeline
 * @author lzzz
 */
const autoIncrement = require('mongoose-auto-increment');
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const TimelineSchema = new Schema({
    // 标题
    title: { type: String, require: true, validate: /\S+/ },

    // 内容
    body: { type: String, require: true },

    // 是否完成
    finish: { type: Boolean, require: true, default: false },

    // 计划完成时间
    date: { type: String },

    // 创建时间
    createTime: { type: Number, default: Date.now },
    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

// 自增ID插件配置
autoIncrement.initialize(mongoose.connection)
TimelineSchema.plugin(autoIncrement.plugin, {
    model: 'Timeline',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

// 4.将文档结构发布为模型
module.exports = mongoose.model('Timeline', TimelineSchema);
