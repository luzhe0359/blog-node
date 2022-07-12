/**
 * Article model module.
 * @Article 文章数据模型
 * @module model/Article
 * @author lzzz
 */
const { mongoose } = require('../middleware/mongoose')
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    // 标题
    title: { type: String, require: true, validate: /\S+/ },

    // 作者
    author: { type: Schema.Types.ObjectId, ref: 'User' },

    // 描述
    desc: { type: String, require: true },

    // 类型
    type: { type: String, require: true },

    // 内容 md
    mdContent: { type: String, require: true },

    // 内容 html
    htmlContent: { type: String, require: true },

    // 是否置顶
    isTop: { type: Boolean, default: false },

    // 字数
    numbers: { type: Number, default: 0 },

    // 封面
    imgCover: { type: String, default: 'https://oss.zugelu.com/other/not_found.png' },

    // 文章类型  | 1:原创 | 2:转载 
    type: { type: Number, default: 1 },

    // 文章发布状态 | 1:已发布 | 2:草稿 | 3:垃圾箱
    state: { type: Number, default: 1 },

    // 文章标签
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag', required: true }],

    // 文章分类
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    // 点赞的用户
    likes: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],

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

module.exports = mongoose.model('Article', ArticleSchema);
