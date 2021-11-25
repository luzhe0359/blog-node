const express = require('express');
const router = express.Router();

const Article = require('../models/article')
const Comment = require('../models/comment')
const User = require('../models/user')
const { CODE } = require('../config')
const { set, get } = require('../middleware/redis');


// 查找文章列表
router.get('/list', async (req, res, next) => {
  const { title, category, tag, state, isTop, pageNum = 1, pageSize = 10, sortBy = 'createTime', descending = -1 } = req.query
  try {
    console.log(tag)
    // 查询条件
    let filter = {}
    title && (filter.title = { $regex: new RegExp(title, 'i') })
    category && (filter.category = category)
    tag && (filter.tags = { $in: [tag] })
    state && (filter.state = state)
    isTop && (filter.isTop = isTop)
    let select = {
    }
    // 总数
    const total = await Article.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    let sort = {}
    sort[sortBy] = parseInt(descending)

    const r = await Article.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(['tags', 'category', { path: 'author', select: { password: 0 } }]) // 连表查询

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '文章列表获取成功',
      pageNum: pageNum - 0, // 转为数字类型
      pageSize: limit,
      pageCount: Math.ceil(total / limit),
      sortBy: sortBy,
      sort: descending - 0,
      total
    })
  } catch (err) {
    next(err)
  }
});

// 查找置顶，热门文章列表
router.get('/tophot', async (req, res, next) => {
  const { pageNum = 1, pageSize = 10 } = req.query
  try {
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    // 查询条件
    let hotFilter = {
      isTop: true,
      state: 1
    }
    // 总数
    const hotTotal = await Article.countDocuments(hotFilter)
    const hotList = await Article.find(hotFilter)
      .sort({ 'createTime': -1 })
      .skip(skip)
      .limit(limit)
      .populate(['tags', 'category', { path: 'author', select: { password: 0 } }])

    // 查询条件
    let topFilter = {
      state: 1
    }
    // 总数
    const topTotal = await Article.countDocuments(topFilter)
    const topList = await Article.find(topFilter)
      .sort({ 'meta.views': -1 })
      .skip(skip)
      .limit(limit)
      .populate(['tags', 'category', { path: 'author', select: { password: 0 } }])

    return res.status(200).json({
      code: CODE.OK,
      hot: {
        list: hotList,
        pageNum: 1,
        pageSize,
        sortBy: "createTime",
        sort: -1,
        total: hotTotal
      },
      top: {
        list: topList,
        pageNum: 1,
        pageSize,
        sortBy: "createTime",
        sort: -1,
        total: topTotal
      },
      msg: '置顶和热门文章列表获取成功',
    })
  } catch (err) {
    next(err)
  }
});

// 添加文章
router.post('/add', async (req, res, next) => {
  try {
    const r = await new Article(req.body).save()

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 查找单个文章
router.get('/:_id', async (req, res, next) => {
  const { _id } = req.params
  let viewKey = req.ip + '-' + _id

  try {
    // 返回的字段
    let project = {
    }

    // 修改文章阅读量
    // 查找redis记录
    let hasView = await get(viewKey)
    // 未预览
    if (!hasView) {
      await Article.findByIdAndUpdate(_id, {
        $inc: { 'meta.views': 1 } // 阅读量 +1
      })
      // 一小时后清除
      set(viewKey, _id, 3600)
    }

    let r = await Article.findById(_id)
      .select(project)
      .populate(["tags", "category"])

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '文章信息获取成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 删除单个文章
router.delete('/:_id', async (req, res, next) => {
  try {
    const r = await Article.findByIdAndDelete(req.params._id)
    await Comment.deleteMany({ articleId: req.params._id })

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 编辑文章信息
router.put('/:_id', async (req, res, next) => {
  try {
    const r = await Article.findByIdAndUpdate(req.params._id, req.body)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 文章点赞
router.post('/like', async (req, res, next) => {
  try {
    const user = req.user

    if (!user._id) {
      return res.status(200).json({
        code: CODE.NOT_LOGIN,
        msg: '请先登录'
      })
    }

    await Article.findByIdAndUpdate(req.body.articleId, {
      $addToSet: { likes: user._id }, // 保存点赞用户_id
      $inc: { 'meta.likes': 1 } // 点赞数 +1
    })
    const u = await User.findByIdAndUpdate(user._id, {
      $addToSet: { likeArticles: req.body.articleId },
    }, { new: true })
      .select({ password: 0 })

    return res.status(200).json({
      code: CODE.OK,
      data: u,
      msg: '点赞成功'
    })
  } catch (err) {
    next(err)
  }
});

// 取消点赞
router.post('/nolike', async (req, res, next) => {
  try {
    const user = req.user
    if (!user._id) {
      return res.status(200).json({
        code: CODE.NOT_LOGIN,
        msg: '请先登录'
      })
    }

    const r = await Article.findByIdAndUpdate(req.body.articleId, {
      $pull: { likes: user._id },
      $inc: { 'meta.likes': -1 }
    }, { new: true })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '取消点赞'
    })
  } catch (err) {
    next(err)
  }
});

// 文章总数、点赞总数
router.post('/count', async (req, res, next) => {
  try {
    // 文章总数
    const total = await Article.countDocuments()
    // 其他统计
    const meta = await Article.aggregate([{ $group: { _id: null, views: { $sum: "$meta.views" }, likes: { $sum: "$meta.likes" }, comments: { $sum: "$meta.comments" } } }])
    // 分类统计
    const categorys = await Article.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "articles"
        },
      },
      {
        $addFields: { // 将数组转对象
          "name": {
            $first: "$articles.name"
          }
        }
      },
      {
        $project: {
          articles: 0,
          _id: 0
        },
      },
    ])

    if (meta.length > 0) {
      delete meta[0]._id
    }

    return res.status(200).json({
      code: CODE.OK,
      data: { total, ...meta[0], categorys },
      msg: '站点信息统计获取成功'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
