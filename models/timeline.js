/**
 * Timeline model module.
 * @Timeline 时间线数据模型
 * @module model/Timeline
 * @author lzzz
 */
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

module.exports = mongoose.model('Timeline', TimelineSchema);
