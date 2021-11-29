const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const Album = require('../models/album')
const Photo = require('../models/photo')
const { CODE } = require('../config')

// 添加相册
router.post('/add', async (req, res, next) => {
  const { name } = req.body
  try {
    const album = await Album.find({ name })
    if (album.length > 0) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '该相册已添加'
      })
    }
    const r = await new Album(req.body).save()

    res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '添加成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找相册列表
router.get('/list', async (req, res, next) => {
  const { name = '', pageNum = 1, pageSize = 10, sortBy = 'createTime', descending = 1 } = req.query
  try {
    let filter = {}
    name && (filter.name = { $regex: new RegExp(name, 'i') })
    let select = {
    }

    // 总数
    const total = await Album.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize)
    let skip = (pageNum - 1) * limit
    let sort = {}
    sort[sortBy] = parseInt(descending)

    const r = await Album.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '相册列表获取成功',
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

// 根据_id 编辑相册信息
router.put('/:_id', async (req, res, next) => {
  try {
    const r = await Album.findByIdAndUpdate(req.params._id, req.body, { new: true })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 删除单个相册
router.delete('/:_id', async (req, res, next) => {
  try {
    // 删除本地图片
    let photos = await Photo.find({ album: req.params._id })
    photos.forEach(photo => {
      const photoUrl = path.resolve(__dirname, '../public', '.' + photo.url)
      // 判断文件的状态，是否存在
      fs.access(photoUrl, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(photoUrl, (err) => err) // 异步删除
          // fs.unlinkSync(photoUrl) // 同步删除
        }
      });
    })

    // 删除图片
    await Photo.deleteMany({ album: req.params._id })
    // 删除相册
    await Album.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
