const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment')
const Article = require('../models/article')
const { CODE } = require('../config/config')

// 添加父评论
router.post('/add', async (req, res, next) => {
  let body = req.body
  try {
    const r = await new Comment(body).save()
    await Article.findByIdAndUpdate(body.articleId, { $inc: { 'meta.comments': 1 } })// 评论数 +1

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 添加子评论
router.post('/addChild', async (req, res, next) => {
  let body = req.body
  try {
    const { commentId, from, to, content, level } = body
    const r = await Comment.findByIdAndUpdate(commentId, {
      $addToSet: {
        otherComments: {
          from: from,
          to: to,
          content: content,
          level: level
        }
      }
    }, { new: true })
    await Article.findByIdAndUpdate(r.articleId, { $inc: { 'meta.comments': 1 } })// 评论数 +1

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找评论列表
router.post('/', async (req, res, next) => {
  const body = req.body
  try {
    let content = body.content || ''
    let articleId = body.articleId || ''
    let filter = {} // 定义查询条件
    content && (filter.content = { $regex: new RegExp(content, 'i') })
    articleId && (filter.articleId = articleId)
    let select = { // 规定不返回的字段
    }

    // 总数
    const total = await Comment.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let limit = body.pageSize === 0 ? total : parseInt(body.pageSize) || 0 // 每页条数 (0 获取所有, 不传值获取所有)
    let skip = (pageNum - 1) * limit // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createTime'] = body.descending ? 1 : -1

    const r = await Comment.find(filter)
      .select(select) // 过滤展示字段
      .sort(sort) // 排序
      .skip(skip) // 跳过多少条
      .limit(limit) // 每页多少条
      .populate([ // 连表查询
        { path: 'articleId', select: "_id title", as: 'article' },
        { path: 'user', select: "_id nickname avatar" },
        { path: 'otherComments.from', select: "_id nickname avatar" },
        { path: 'otherComments.to', select: "_id nickname avatar" }
      ])

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '评论列表获取成功',
      pageNum: pageNum,
      pageSize: limit,
      sortBy: body.sortBy,
      total: total
    })
  } catch (err) {
    next(err)
  }
});


// 根据_id 删除单个评论
router.delete('/:_id', async (req, res, next) => {
  try {
    const r = await Comment.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

// 评论 点赞/取消
router.post('/like', async (req, res, next) => {
  let body = req.body
  try {
    let { commentId, otherCommentId, userId } = body
    let r = null, isLike = null
    // 判断 父评论/子评论
    if (otherCommentId) { // 子评论
      // 查询该用户是否点过赞
      const likeResult = await Comment.findOne({ _id: commentId, otherComments: { $elemMatch: { _id: otherCommentId, likes: { $in: [userId] } } } })

      // 判断是否点过赞   有数据,则点过
      isLike = !!likeResult

      // 点赞，则去除；没点，则添加
      const update = isLike ? { $pull: { "otherComments.$.likes": req.body.userId } } : { $addToSet: { "otherComments.$.likes": userId } }

      // 查找到子评论并修改点赞状态
      r = await Comment.findOneAndUpdate({ _id: commentId, otherComments: { $elemMatch: { _id: otherCommentId } } }, update, { new: true })
    } else { // 父评论
      const likeResult = await Comment.findOne({ _id: commentId, likes: { $in: [userId] } })
      isLike = !!likeResult
      const update = isLike ? { $pull: { likes: req.body.userId } } : { $addToSet: { likes: userId } }
      r = await Comment.findByIdAndUpdate(commentId, update, { new: true })
    }
    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: isLike ? '取消成功' : '点赞成功'
    })
  } catch (err) {
    next(err)
  }
});

// 更改评论状态
// 根据_id 编辑标签信息
router.put('/state/:_id', async (req, res, next) => {
  const body = req.body
  try {
    let { state, otherCommentId } = body
    let r = null
    // 判断 父评论/子评论
    if (otherCommentId) {// 子评论
      r = await Comment.findOneAndUpdate({ _id: req.params._id, otherComments: { $elemMatch: { _id: otherCommentId } } }, { $set: { "otherComments.$.state": state } }, { new: true })
    } else { // 父评论
      r = await Comment.findByIdAndUpdate(req.params._id, body, { new: true })
    }

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
