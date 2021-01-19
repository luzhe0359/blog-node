const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const File = require('../models/file')
const { CODE } = require('../config/config')

// const uploader = multer({
//     dest: path.join(path.dirname(__dirname), 'public', 'images'),
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now())
//     }
// })

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'public', 'images'))
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

const uploader = multer({ storage: storage })

/* GET home page. */
/**
 * 图片上传
 */

// image: 为name的名字  single为uploader自带方法，uploadHead为回调函数
router.post('/', uploader.single('file'), async (req, res, next) => {
    const file = req.file
    //获取后缀名
    const extname = path.extname(file.originalname)
    //获取上传成功之后的文件路径
    const filepath = file.path
    //上传之后文件的名称
    const imageUrl = file.filename + extname
    const filename = filepath + extname
    try {
        //重命名(和参数一地址相同，只不过名字变了而已，两个参数都是地址)
        /**
         *  @param filepath 源文件地址路径
         *  @param filename 改名后的地址
         */
        fs.rename(filepath, filename, async err => {
            if (!err) {
                // 保存到数据库
                const f = await new File({
                    name: file.originalname,
                    url: '/images/' + imageUrl,
                    size: file.size,
                    type: file.mimetype
                }).save()

                res.status(200).json({
                    code: CODE.OK,
                    data: f,
                    msg: '上传成功'
                })
            }
        })
    } catch (err) {
        next(err)
    }
})
module.exports = router;
