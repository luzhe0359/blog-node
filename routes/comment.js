const express = require('express');
const router = express.Router();

const Comment = require('../models/comment')
const Article = require('../models/article')
const { CODE } = require('../config/config')

// 查找评论列表
router.get('/list', async (req, res, next) => {
  const { state, content, articleId, pageNum = 1, pageSize = 0, sortBy = 'createTime', descending = -1 } = req.query
  try {
    // 查询条件
    let filter = {}
    content && (filter.content = { $regex: new RegExp(content, 'i') })
    articleId && (filter.articleId = articleId)
    if (state == -1) {
      filter.state = { $nin: [-1] }
    }

    let select = {
    }

    // 总数
    const total = await Comment.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    let sort = {}
    sort[sortBy] = parseInt(descending)

    let r = await Comment.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate([ // 连表查询
        { path: 'articleId', select: "_id title", as: 'article' },
        { path: 'from', select: "_id nickname avatar" },
        { path: 'otherComments.from', select: "_id nickname avatar" },
        { path: 'otherComments.to', select: "_id nickname avatar" }
      ])

    // 过滤非法 评论
    if (state == -1) {
      r = r.map(comment => {
        comment.otherComments = comment.otherComments.filter(c => c.state !== -1)
        return comment
      })
    }

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '评论列表获取成功',
      pageNum: pageNum - 0,
      pageSize: limit,
      pageCount: Math.ceil(total / limit),
      sortBy: sortBy,
      sort: descending - 0,
      total: total
    })
  } catch (err) {
    next(err)
  }
});

// 添加评论
router.post('/add', async (req, res, next) => {
  const { articleId, commentId, to, content, level } = req.body

  try {
    // 判断是否登录
    const user = req.user
    if (!user._id) {
      return res.status(200).json({
        code: CODE.NOT_LOGIN,
        msg: '请先登录'
      })
    }

    if (level) { // 子评论
      await Comment.findByIdAndUpdate(commentId, {
        $addToSet: {
          otherComments: {
            from: user._id,
            to: to,
            content: content,
            level: level
          }
        }
      }, { new: true })
    } else { // 父评论
      await new Comment({ articleId, content, from: user._id }).save()
    }

    await Article.findByIdAndUpdate(articleId, { $inc: { 'meta.comments': 1 } })// 评论数 +1

    res.status(200).json({
      code: CODE.OK,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});


// 根据_id 删除单个评论
router.delete('/:_id', async (req, res, next) => {
  try {
    await Comment.findByIdAndDelete(req.params._id)

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
  const { commentId, otherCommentId, userId } = req.body
  try {
    let r = null, isLike = null
    // 判断 父评论/子评论
    if (otherCommentId) { // 子评论
      // 查询该用户是否点过赞
      const likeResult = await Comment.findOne({ _id: commentId, otherComments: { $elemMatch: { _id: otherCommentId, likes: { $in: [userId] } } } })

      // 判断是否点过赞   有数据,则点过
      isLike = !!likeResult

      // 点赞，则去除；没点，则添加
      const update = isLike ? { $pull: { "otherComments.$.likes": userId } } : { $addToSet: { "otherComments.$.likes": userId } }

      // 查找到子评论并修改点赞状态
      r = await Comment.findOneAndUpdate({ _id: commentId, otherComments: { $elemMatch: { _id: otherCommentId } } }, update, { new: true })
    } else { // 父评论
      const likeResult = await Comment.findOne({ _id: commentId, likes: { $in: [userId] } })
      isLike = !!likeResult
      const update = isLike ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } }
      r = await Comment.findByIdAndUpdate(commentId, update, { new: true })
    }
    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: isLike ? '取消点赞' : '点赞成功'
    })
  } catch (err) {
    next(err)
  }
});

// 更改评论状态
// 根据_id 编辑标签信息
router.put('/state/:_id', async (req, res, next) => {
  const { state, otherCommentId } = req.body
  try {
    let r = null
    // 判断 父评论/子评论
    if (otherCommentId) { // 子评论
      r = await Comment.findOneAndUpdate({ _id: req.params._id, otherComments: { $elemMatch: { _id: otherCommentId } } }, { $set: { "otherComments.$.state": state } }, { new: true })
        .populate([{ path: 'otherComments.from', select: "_id nickname avatar" }])
    } else { // 父评论
      r = await Comment.findByIdAndUpdate(req.params._id, req.body, { new: true })
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
