const express = require('express');
const router = express.Router();

const Tag = require('../models/tag')
const Article = require('../models/article')
const { CODE } = require('../config/config')

// 添加标签
router.post('/add', async (req, res, next) => {
  const { name } = req.body
  try {
    const tag = await Tag.find({ name })
    if (tag.length > 0) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '该标签已添加'
      })
    }
    const r = await new Tag(req.body).save()

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
router.get('/list', async (req, res, next) => {
  const { name = '', pageNum = 1, pageSize = 0, sortBy = 'createTime', descending = 1 } = req.query
  try {
    let filter = {}
    name && (filter.name = { $regex: new RegExp(name, 'i') })
    let select = {
    }

    // 总数
    const total = await Tag.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    let sort = {}
    sort[sortBy] = parseInt(descending)

    const r = await Tag.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '标签列表获取成功',
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

// 查找标签统计
router.get('/count', async (req, res, next) => {
  try {
    const r = await Article.aggregate([
      {
        $match: {
          state: 1,
        }
      },
      { "$unwind": "$tags" },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tags"
        }
      },
      {
        $addFields: { // 将数组转对象
          "name": {
            $first: "$tags.name"
          }
        }
      },
      {
        $project: {
          tags: 0,
        }
      }
    ])

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '标签统计获取成功',
    })
  } catch (err) {
    next(err)
  }
});



// 根据_id 编辑标签信息
router.put('/:_id', async (req, res, next) => {
  try {
    const r = await Tag.findByIdAndUpdate(req.params._id, req.body, { new: true })

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
    await Tag.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
