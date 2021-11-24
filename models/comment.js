/**
 * Comment model module.
 * @Comment 评论数据模型
 * @module model/Comment
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    // 评论所在的文章 id
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },

    // 评论所在的文章 id
    photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },

    // 谁在评论
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // 评论内容
    content: { type: String, required: true, validate: /\S+/ },

    // 是否置顶
    isTop: { type: Boolean, default: false },

    // 点赞的用户
    likes: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],

    // 第三者评论
    otherComments: [
        {
            // 谁在评论
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

            // 对谁评论
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

            // 点赞的用户
            likes: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],

            // 评论内容
            content: { type: String, required: true, validate: /\S+/ },

            // 状态 | 0:待审核 | 1:已通过 | -1:未通过
            state: { type: Number, default: 0 },

            // 评论层级 | 2:1级评论的回复内容 | 3:2级评论的回复内容
            level: { type: Number, default: 2 },

            // 创建时间
            createTime: { type: Number, default: Date.now },
        },
    ],

    // 状态(先发表，后审核) | 0:待审核 | 1:已通过 | -1:未通过
    state: { type: Number, default: 0 },

    // 类型 | 1:文章 | 2:留言 | 3:相册
    type: { type: Number, default: 1 },

    // 创建时间
    createTime: { type: Number, default: Date.now },

    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

module.exports = mongoose.model('Comment', CommentSchema);
