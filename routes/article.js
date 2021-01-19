const express = require('express');
const router = express.Router();

const Article = require('../models/article')
const { CODE } = require('../config/config')

// 添加文章
router.post('/add', async (req, res, next) => {
  let body = req.body
  try {
    const r = await new Article(body).save()

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找文章列表
router.post('/', async (req, res, next) => {
  const body = req.body
  try {
    // 标题 模糊查询
    let title = body.title || ''
    let filter = {} // 定义查询条件
    title && (filter.title = { $regex: new RegExp(title, 'i') })
    // 返回的字段
    let select = {
      _id: 1,
      title: 1,
      author: 1,
      type: 1,
      tags: 1,
      category: 1,
      likes: 1,
      meta: 1,
      createTime: 1,
    }
    // 总数
    const total = await Article.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let limit = body.pageSize === 0 ? total : parseInt(body.pageSize) || 10 // 每页条数 (0 获取所有)
    let skip = (pageNum - 1) * limit // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createTime'] = body.descending ? 1 : -1


    const r = await Article.find(filter)
      .select(select) // 过滤展示字段
      .sort(sort) // 排序
      .skip(skip) // 跳过多少条
      .limit(limit) // 每页多少条
      .populate(['tags', 'category', { path: 'author', select: { password: 0 } }]) // 连表查询

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '文章列表获取成功',
      pageNum: pageNum,
      pageSize: limit,
      sortBy: body.sortBy,
      total: total,
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 查找单个文章
router.get('/:_id/:_uid', async (req, res, next) => {
  try {
    // 返回的字段
    let project = {
      _id: 1,
      title: 1,
      author: 1,
      mdContent: 1,
      htmlContent: 1,
      type: 1,
      tags: 1,
      likes: 1,
      isLike: 1,
      createTime: 1,
    }

    let r = await Article.findById(req.params._id)
      .select(project) // 过滤展示字段
      .populate(["tags"])

    // 查看用户是否点赞该文章
    const like = await Article.find({ _id: r._id, likes: req.params._uid })
    r = r.toObject() // doc.toObject() 后再添加属性，因为mongoose定义了自己的toJson，如不转换则新增的属性都不在toJson方法里
    r.isLike = like.length > 0

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
    const r = await Article.findByIdAndUpdate(req.body.articleId, {
      $addToSet: { likes: req.body.userId }, // 保存点赞用户_id
      $inc: { 'meta.likes': 1 } // 点赞数 +1
    }, { new: true })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '点赞成功'
    })
  } catch (err) {
    next(err)
  }
});

// 取消点赞
router.post('/nolike', async (req, res, next) => {
  try {
    const r = await Article.findByIdAndUpdate(req.body.articleId, {
      $pull: { likes: req.body.userId },
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


module.exports = router;
