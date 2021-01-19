const express = require('express');
const router = express.Router();

const Tag = require('../models/tag')
const { CODE } = require('../config/config')

// 添加标签
router.post('/add', async (req, res, next) => {
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

// 查找标签列表
router.post('/', async (req, res, next) => {
  const body = req.body
  try {
    let name = body.name || ''
    let filter = {} // 定义查询条件
    name && (filter.name = { $regex: new RegExp(name, 'i') })
    let select = { // 规定不返回的字段
    }

    // 总数
    const total = await Tag.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let limit = body.pageSize === 0 ? total : parseInt(body.pageSize) || 0 // 每页条数 (0 获取所有, 不传值获取所有)
    let skip = (pageNum - 1) * limit // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createTime'] = body.descending ? 1 : -1

    const r = await Tag.find(filter)
      .select(select) // 过滤展示字段
      .sort(sort) // 排序
      .skip(skip) // 跳过多少条
      .limit(limit) // 每页多少条

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '标签列表获取成功',
      pageNum: pageNum,
      pageSize: limit,
      sortBy: body.sortBy,
      total: total
    })
  } catch (err) {
    next(err)
  }
});


// 根据_id 编辑标签信息
router.put('/:_id', async (req, res, next) => {
  const body = req.body
  try {
    const tag = await Tag.find({ name: body.name })
    if (tag.length > 0) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '该标签已添加'
      })
    }

    const r = await Tag.findByIdAndUpdate(req.params._id, body, { new: true })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 删除单个标签
router.delete('/:_id', async (req, res, next) => {
  try {
    const r = await Tag.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
