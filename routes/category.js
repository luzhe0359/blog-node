const express = require('express');
const router = express.Router();

const Category = require('../models/category')
const { CODE } = require('../config/config')

// 添加分类
router.post('/add', async (req, res, next) => {
  let body = req.body
  try {
    const category = await Category.find({ name: body.name })
    if (category.length > 0) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '该分类已添加'
      })
    }
    const r = await new Category(body).save()

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
router.post('/', async (req, res, next) => {
  const body = req.body
  try {
    let name = body.name || ''
    let filter = {} // 定义查询条件
    name && (filter.name = { $regex: new RegExp(name, 'i') })
    let select = { // 规定不返回的字段
    }

    // 总数
    const total = await Category.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let limit = body.pageSize === 0 ? total : parseInt(body.pageSize) || 0 // 每页条数 (0 获取所有, 不传值获取所有)
    let skip = (pageNum - 1) * limit // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createTime'] = body.descending ? 1 : -1

    const r = await Category.find(filter)
      .select(select) // 过滤展示字段
      .sort(sort) // 排序
      .skip(skip) // 跳过多少条
      .limit(limit) // 每页多少条

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '分类列表获取成功',
      pageNum: pageNum,
      pageSize: limit,
      sortBy: body.sortBy,
      total: total
    })
  } catch (err) {
    next(err)
  }
});


// 根据_id 编辑分类信息
router.put('/:_id', async (req, res, next) => {
  const body = req.body
  try {
    const Category = await Category.find({ name: body.name })
    if (Category.length > 0) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '该分类已添加'
      })
    }

    const r = await Category.findByIdAndUpdate(req.params._id, body, { new: true })

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
