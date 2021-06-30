const express = require('express');
const router = express.Router();

const Message = require('../models/message')
const { CODE } = require('../config/config')

// 查找留言列表
router.get('/list', async (req, res, next) => {
  const { state, content, pageNum = 1, pageSize = 0, sortBy = 'createTime', descending = -1 } = req.query
  try {
    // 查询条件
    let filter = {}
    content && (filter.content = { $regex: new RegExp(content, 'i') })
    if (state == -1) {
      filter.state = { $nin: [-1] }
    }

    let select = {
    }

    // 总数
    const total = await Message.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    let sort = {}
    sort[sortBy] = parseInt(descending)

    let r = await Message.find(filter)
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

    // 过滤2级非法 留言
    if (state == -1) {
      r = r.map(message => {
        message.otherComments = message.otherComments.filter(c => c.state !== -1)
        return message
      })
    }

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '留言列表获取成功',
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

// 添加留言
router.post('/add', async (req, res, next) => {
  const { commentId, to, content, level } = req.body

  try {
    // 判断是否登录
    const user = req.user
    if (!user._id) {
      return res.status(200).json({
        code: CODE.NOT_LOGIN,
        msg: '请先登录'
      })
    }

    if (level) { // 子留言
      await Message.findByIdAndUpdate(commentId, {
        $addToSet: {
          otherComments: {
            from: user._id,
            to: to,
            content: content,
            level: level
          }
        }
      }, { new: true })
    } else { // 父留言
      await new Message({ content, from: user._id }).save()
    }

    res.status(200).json({
      code: CODE.OK,
      msg: '留言成功'
    })
  } catch (err) {
    console.log(err);
    next(err)
  }
});


// 根据_id 删除单个留言
router.delete('/:_id', async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});


// 更改留言状态
// 根据_id 编辑标签信息
router.put('/state/:_id', async (req, res, next) => {
  const { state, otherCommentId } = req.body
  try {
    let r = null
    // 判断 父留言/子留言
    if (otherCommentId) { // 子留言
      r = await Message.findOneAndUpdate({ _id: req.params._id, otherComments: { $elemMatch: { _id: otherCommentId } } }, { $set: { "otherComments.$.state": state } }, { new: true })
        .populate([{ path: 'otherComments.from', select: "_id nickname avatar" }])
    } else { // 父留言
      r = await Message.findByIdAndUpdate(req.params._id, req.body, { new: true })
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
