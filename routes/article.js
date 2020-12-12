const express = require('express');
const router = express.Router();

const Article = require('../models/article')
const { CODE } = require('../config/config')

// 添加文章
router.post('/add', async function (req, res, next) {
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
router.post('/', async function (req, res, next) {
  const body = req.body
  try {
    // 标题 模糊查询
    let title = body.title || ''
    let filter = {} // 定义查询条件
    title && (filter.title = { $regex: new RegExp(title, 'i') })
    let projection = { // 规定不返回的字段
    }

    // 总数
    const total = await Article.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let pageSize = body.pageSize === 0 ? total : parseInt(body.pageSize) || 10 // 每页条数 (0 获取所有)
    let skip = (pageNum - 1) * pageSize // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createdTime'] = body.descending ? 1 : -1
    // 查询
    Article.find(
      filter
    )
      .select(projection)
      .limit(pageSize) // 每页多少数据
      .skip(skip)
      .sort(sort)
      .then(r => {
        if (r) {
          return res.status(200).json({
            code: CODE.OK,
            data: r,
            msg: '文章列表获取成功',
            pageNum: pageNum,
            pageSize: pageSize,
            sortBy: body.sortBy,
            total: total
          })
        }
      })
  } catch (err) {
    next(err)
  }
});

// 根据id 查找单个文章
router.get('/:id', function (req, res, next) {
  try {
    Article.findById(req.params.id)
      .then(r => {
        if (r) {
          return res.status(200).json({
            code: CODE.OK,
            data: r,
            msg: '文章信息获取成功'
          })
        }
      })
  } catch (err) {
    next(err)
  }
});

// 根据id 删除单个文章
router.delete('/:id', function (req, res, next) {
  try {
    Article.findByIdAndDelete(req.params.id)
      .then(r => {
        if (r) {
          return res.status(200).json({
            code: CODE.OK,
            msg: '删除成功'
          })
        }
      })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
