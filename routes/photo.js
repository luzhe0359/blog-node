const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Photo = require('../models/photo')
const { CODE } = require('../config/config')

var storage = multer.diskStorage({
    //设置上传后文件路径
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'public', 'images'))
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        let exname = path.extname(file.originalname);
        //给图片加上时间戳格式防止重名
        filename = file.fieldname + "-" + Date.now() + exname;
        cb(null, filename)
    }
})

const uploader = multer({ storage: storage })

/**
 * 图片上传(单个)
 */

router.post('/upload', uploader.single('photo'), async (req, res, next) => {
    const file = req.file
    try {
        // 保存到数据库
        const r = await new Photo({
            name: file.originalname,
            url: '/images/' + file.filename,
            size: file.size,
            type: file.mimetype,
            album: req.query.albumId
        }).save()
        res.status(200).json({
            code: CODE.OK,
            data: r,
            msg: '上传成功'
        })
    } catch (err) {
        next(err)
    }
})

/**
 * 图片上传(批量)
 */
router.post('/uploads', uploader.array('photo', 10), async (req, res, next) => {
    if (!req.files) return
    let files = req.files

    try {
        for (let i = 0; i < files.length; i++) {
            let photo = {
                name: files[i].originalname,
                url: '/images/' + files[i].filename,
                size: files[i].size,
                type: files[i].mimetype,
                album: req.query.albumId
            }
            // 保存到数据库
            await new Photo(photo).save()
        }
        res.status(200).json({
            code: CODE.OK,
            msg: '上传成功'
        })
    } catch (err) {
        next(err)
    }
})

// 查找照片列表
router.get('/list', async (req, res, next) => {
    const { albumId = '', pageNum = 1, pageSize = 10, sortBy = 'createTime', descending = 1 } = req.query
    try {
        let filter = {}
        albumId && (filter.album = albumId)
        let select = {
        }

        // 总数
        const total = await Photo.countDocuments(filter)
        // 分页逻辑
        let limit = pageSize === 0 ? total : parseInt(pageSize)
        let skip = (pageNum - 1) * limit
        let sort = {}
        sort[sortBy] = parseInt(descending)

        const r = await Photo.find(filter)
            .select(select)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate(['album'])

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

// 查找相册
router.get('/album', async (req, res, next) => {
    const query = req.query
    try {
        const r = await Photo.aggregate([
            {
                $group: {
                    _id: "$album", // 根据album_id 进行分组
                    count: { $sum: 1 }, // 统计有几条集合数据
                    photos: { $push: "$$ROOT" }, // 分组后的图片
                    // album: { $first: "$albums" } // 取第一个子集的值
                },
            },
            {
                $lookup: { // 左连接
                    from: "albums", // 关联到albums表
                    localField: "_id", // photo 表关联的字段
                    foreignField: "_id", // albums 表关联的字段
                    as: "album"
                }
            },
            {
                $addFields: { // 将album数组转对象
                    "album": {
                        $first: "$album"
                    }
                }
            },
            {
                $project: {
                    count: 1,
                    album: 1,
                    photos: {
                        $slice: [ // 取前五条
                            '$photos',
                            5,
                        ],
                    },
                },
            },
            {
                $match: { // 过滤掉 _id 为 null
                    "_id": { "$ne": null }
                }
            },
            {
                $sort: {
                    "album.createTime": 1
                }
            }
        ])

        return res.status(200).json({
            code: CODE.OK,
            data: r,
            msg: '照片集获取成功',
        })
    } catch (err) {
        next(err)
    }
});

// 根据_id 删除单个图片
router.delete('/:_id', async (req, res, next) => {
    try {
        // 删除本地图片
        const { url } = await Photo.findById(req.params._id)
        const photoUrl = path.resolve(__dirname, '../public', '.' + url)
        // 检查头像是否存在
        fs.access(photoUrl, fs.constants.F_OK, (err) => {
            // console.log(`${photoUrl} ${err ? '不存在' : '存在'}`);
            if (!err) { // 存在
                // fs.unlink(photoUrl)
                fs.unlinkSync(photoUrl) // 同步删除
            }
        });
        // 删除数据库中图片
        const r = await Photo.findByIdAndDelete(req.params._id)

        return res.status(200).json({
            code: CODE.OK,
            msg: '删除成功'
        })
    } catch (err) {
        next(err)
    }
});

module.exports = router;
