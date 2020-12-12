/**
 * Article model module.
 * @article 文章数据模型
 * @module model/Article
 * @author lzzz
 */
const autoIncrement = require('mongoose-auto-increment');
const { mongoose } = require('../utils/mongoose')
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    // 标题
    title: { type: String, require: true },

    // 作者
    author: { type: String, },

    // 文章描述
    desc: { type: String, require: true },

    // 类型
    type: { type: String, require: true },

    // 文章内容 md
    mdContent: { type: String, require: true },

    // 文章内容 html
    htmlContent: { type: String, require: true },

    // 字数
    numbers: { type: Number, default: 0 },

    // 封面
    imgUrl: { type: String, default: '' },

    // 文章类型 | 0:转载 | 1:原创 | 2:混合
    type: { type: Number, default: 0 },

    // 文章发布状态 | 0:草稿 | 1:已发布
    state: { type: Number, default: 0 },

    // 文章标签
    tags: { type: Array, default: [], required: true },

    // // 评论
    // comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', required: true }],

    // // 文章分类
    // category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],

    // 点赞的用户
    likeUsers: [
        {
            // 用户id
            id: { type: Schema.Types.ObjectId },

            // 名字
            name: { type: String, required: true, default: '' },

            // 用户类型 VIP/SVIP
            role: { type: String, default: 'VIP' },

            // 个人介绍
            about: { type: String, default: '' },

            // 头像
            avatar: { type: String, default: 'user' },

            // 创建时间
            createTime: { type: Number, default: Date.now },
        }
    ],

    // 其他元信息
    meta: {
        views: { type: Number, default: 0 }, // 浏览量
        likes: { type: Number, default: 0 }, // 点赞数
        comments: { type: Number, default: 0 }, // 评论数
    },

    // 创建时间
    createTime: { type: Number, default: Date.now },
    // 修改时间
    updateTime: { type: Number, default: Date.now }
}, {
    timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' }
});

// 自增ID插件配置
autoIncrement.initialize(mongoose.connection)
ArticleSchema.plugin(autoIncrement.plugin, {
    model: 'Article',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

// 4.将文档结构发布为模型
module.exports = mongoose.model('Article', ArticleSchema);
