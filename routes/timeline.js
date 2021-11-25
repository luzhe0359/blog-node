const express = require('express');
const router = express.Router();

const Timeline = require('../models/timeline')
const { CODE } = require('../config')

// 添加时间线
router.post('/add', async (req, res, next) => {
  try {
    const r = await new Timeline(req.body).save()

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找时间线列表
router.get('/list', async (req, res, next) => {
  const { title = '', pageNum = 1, pageSize = 0, sortBy = 'createTime', descending = -1 } = req.query
  try {
    // 查询条件
    let filter = {}
    title && (filter.title = { $regex: new RegExp(title, 'i') })
    let select = {
    }

    // 总数
    const total = await Timeline.countDocuments(filter)
    // 分页
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    let sort = {}
    sort[sortBy] = parseInt(descending)

    const r = await Timeline.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '时间线列表获取成功',
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


// 根据_id 编辑标签信息
router.put('/:_id', async (req, res, next) => {
  try {
    const r = await Timeline.findByIdAndUpdate(req.params._id, req.body)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 查找单个时间线
router.get('/:_id', async (req, res, next) => {
  try {
    let r = await Timeline.findById(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '时间线信息获取成功'
    })
  } catch (err) {
    next(err)
  }
});


// 根据_id 编辑时间线信息
router.put('/:_id', async (req, res, next) => {
  try {
    const r = await Timeline.findByIdAndUpdate(req.params._id, req.body)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 删除单个时间线
router.delete('/:_id', async (req, res, next) => {
  try {
    await Timeline.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});


module.exports = router;
