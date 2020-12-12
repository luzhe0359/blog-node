const express = require('express');
const router = express.Router();

const Tag = require('../models/Tag')
const { CODE } = require('../config/config')

// 添加文章
router.post('/add', async function (req, res, next) {
  let body = req.body
  try {
    const tag = await Tag.find({ name: body.name })
    if (tag.length > 0) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '该标签已添加'
      })
    }
    const r = await new Tag(body).save()

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
    let name = body.name || ''
    let filter = {} // 定义查询条件
    name && (filter.name = { $regex: new RegExp(name, 'i') })
    let projection = { // 规定不返回的字段
    }

    // 总数
    const total = await Tag.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let pageSize = body.pageSize === 0 ? total : parseInt(body.pageSize) || 0 // 每页条数 (0 获取所有, 不传值获取所有)
    let skip = (pageNum - 1) * pageSize // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createdTime'] = body.descending ? 1 : -1
    // 查询
    Tag.find(
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
            msg: '标签列表获取成功',
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

// 根据id 查找单个标签
router.get('/:id', function (req, res, next) {
  try {
    Tag.findById(req.params.id)
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

// 根据id 删除单个标签
router.delete('/:id', function (req, res, next) {
  try {
    Tag.findByIdAndDelete(req.params.id)
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
