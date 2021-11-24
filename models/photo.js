/**
 * Photo model module.
 * @Photo 图片数据模型
 * @module model/Photo
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const PhotoSchema = new Schema({
    // 名称
    name: { type: String, require: true },

    // 路径
    url: { type: String, require: true },

    // 大小
    size: { type: String, require: true },

    // 类型 
    type: { type: String },

    // 分类 | avator | article-content | article-cover | album | other
    classify: { type: String },

    // 描述
    desc: { type: String },

    // 相册
    album: { type: Schema.Types.ObjectId, ref: 'Album' },

    // 创建时间
    createTime: { type: Number, default: Date.now },

    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

module.exports = mongoose.model('Photo', PhotoSchema);
