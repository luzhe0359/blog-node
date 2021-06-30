/**
 * Message model module.
 * @Message 留言数据模型
 * @module model/MessageSchema
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    // 谁在留言
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // 留言内容
    content: { type: String, required: true, validate: /\S+/ },

    // 是否置顶
    isTop: { type: Boolean, default: false },

    // 第三者留言
    otherComments: [
        {
            // 谁在留言
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

            // 对谁留言
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

            // content
            content: { type: String, required: true, validate: /\S+/ },

            // 状态 | 0:待审核 | 1:已通过 | -1:未通过
            state: { type: Number, default: 0 },

            // 留言层级 | 2:1级留言的回复内容 | 3:2级留言的回复内容
            level: { type: Number, default: 2 },

            // 创建时间
            createTime: { type: Number, default: Date.now },
        },
    ],

    // 状态(先发表，后审核) | 0:待审核 | 1:已通过 | -1:未通过
    state: { type: Number, default: 0 },

    // 创建时间
    createTime: { type: Number, default: Date.now },

    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

module.exports = mongoose.model('Message', MessageSchema);
