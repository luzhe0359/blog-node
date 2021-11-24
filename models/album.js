/**
 * Album model module.
 * @Album 相册数据模型
 * @module model/Album
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
    // 名称
    name: { type: String, require: true, validate: /\S+/ },

    // 描述
    desc: { type: String },

    // 创建时间
    createTime: { type: Number, default: Date.now },

    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

module.exports = mongoose.model('Album', AlbumSchema);
