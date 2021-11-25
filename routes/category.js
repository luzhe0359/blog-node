const express = require('express');
const router = express.Router();

const Category = require('../models/category')
const { CODE } = require('../config')

// 添加分类
router.post('/add', async (req, res, next) => {
  const { name } = req.body
  try {
    const category = await Category.find({ name })
    if (category.length > 0) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '该分类已添加'
      })
    }
    const r = await new Category(req.body).save()

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找分类列表
router.get('/list', async (req, res, next) => {
  const { name = '', pageNum = 1, pageSize = 10, sortBy = 'createTime', descending = 1 } = req.query
  try {
    // 查询条件
    let filter = {}
    name && (filter.name = { $regex: new RegExp(name, 'i') })
    let select = {
    }

    // 总数
    const total = await Category.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    let sort = {}
    sort[sortBy] = parseInt(descending)

    const r = await Category.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '分类列表获取成功',
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


// 根据_id 编辑分类信息
router.put('/:_id', async (req, res, next) => {
  try {
    const r = await Category.findByIdAndUpdate(req.params._id, req.body, { new: true })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 删除单个分类
router.delete('/:_id', async (req, res, next) => {
  try {
    const r = await Category.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
