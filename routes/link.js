const express = require('express');
const router = express.Router();

const Link = require('../models/link')
const { CODE } = require('../config/config')

// 添加友链
router.post('/add', async (req, res, next) => {
  try {
    const r = await new Link(req.body).save()

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找友链列表
router.get('/list', async (req, res, next) => {
  const { title = '', isStop, pageNum = 1, pageSize = 10, sortBy = 'createTime', descending = 1 } = req.query
  try {
    // 标题 模糊查询
    let filter = {} // 定义查询条件
    title && (filter.title = { $regex: new RegExp(title, 'i') })
    isStop && (filter.isStop = isStop)
    // 返回的字段
    let select = {
    }

    // 总数
    const total = await Link.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize) // 每页条数 (0 获取所有)
    let skip = (pageNum - 1) * limit // 跳过多少条
    let sort = {} // 排序
    sort[sortBy] = parseInt(descending)

    const r = await Link.find(filter)
      .select(select) // 过滤展示字段
      .sort(sort) // 排序
      .skip(skip) // 跳过多少条
      .limit(limit) // 每页多少条

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '友链列表获取成功',
      pageNum: pageNum - 0,
      pageSize: limit,
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
    const r = await Link.findByIdAndUpdate(req.params._id, req.body, { new: true })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 查找单个友链
router.get('/:_id', async (req, res, next) => {
  try {
    // 返回的字段
    let select = {
    }

    // 修改友链
    let r = await Link.findById(req.params._id)
      .select(select) // 过滤展示字段

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '友链信息获取成功'
    })
  } catch (err) {
    next(err)
  }
});


// 根据_id 编辑友链信息
router.put('/:_id', async (req, res, next) => {
  try {
    const r = await Link.findByIdAndUpdate(req.params._id, req.body)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 删除单个友链
router.delete('/:_id', async (req, res, next) => {
  try {
    await Link.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});


module.exports = router;
