const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const sha256 = require("crypto-js/sha256");

const User = require('../models/user')
const { CRYPTO_KEY, CODE, TOKEN_TIME } = require('../config/config')
const { aesDecrypt } = require('../utils/crypto');
const { set, get, getToken, remove } = require('../utils/redis');


// 用户登录
router.post('/login', async (req, res, next) => {
  let body = req.body
  try {
    // 获取初始密码
    let encryptPassword = aesDecrypt(body.password)
    // 对初始密码、进行不可逆加密
    let decryptPassword = sha256(encryptPassword + CRYPTO_KEY).toString();
    body.password = decryptPassword
    // 查找用户
    User.findOne(body)
      .then(user => {
        if (!user) {
          return res.status(200).json({
            code: CODE.USER_ERR,
            msg: '用户名或密码错误!'
          })
        }
        /**
         * @param {Object} 需要加密的用户信息
         * @param {String} 秘钥
         * @param {Date} expiresIn 过期时间
         */
        const token = jwt.sign(
          { userId: user._id },
          CRYPTO_KEY,
          { expiresIn: TOKEN_TIME }
        )
        set(token, user.username)
        return res.status(200).json({
          code: CODE.OK,
          data: {
            token,
            user
          },
          msg: '登录成功'
        })
      })
  } catch (err) {
    next(err)
  }
})

// 用户退出
router.post('/logout', async (req, res, next) => {
  let body = req.body
  try {
    let token = getToken(req.headers)
    let del = await remove(token)
    if (del) {
      return res.status(200).json({
        code: CODE.OK,
        msg: '退出成功'
      })
    }
  } catch (err) {
    next(err)
  }
})

// 添加用户
router.post('/add', async function (req, res, next) {
  let body = req.body
  try {
    // 获取初始密码
    let encryptPassword = aesDecrypt(body.password)
    // 对初始密码、进行不可逆加密
    let decryptPassword = sha256(encryptPassword + CRYPTO_KEY).toString();
    body.password = decryptPassword

    // 创建用户，执行注册
    await new User(body).save()

    res.status(200).json({
      code: CODE.OK,
      msg: '注册成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找用户列表
router.post('/', async function (req, res, next) {
  const body = req.body
  // get(getToken(req.headers))
  try {
    // 用户名、昵称 模糊查询
    let username = body.username || ''
    let nickname = body.nickname || ''
    let filter = {} // 定义查询条件
    username && (filter.username = { $regex: new RegExp(username || '', 'i') })
    nickname && (filter.nickname = { $regex: new RegExp(nickname || '', 'i') })
    let projection = { // 规定不返回的字段
      password: 0
    }

    // 总数
    const total = await User.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let pageSize = body.pageSize === 0 ? total : parseInt(body.pageSize) || 10 // 每页条数 (0 获取所有)
    let skip = (pageNum - 1) * pageSize // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createdTime'] = body.descending ? 1 : -1
    // 查询
    User.find(
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
            msg: '用户列表获取成功',
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

// 根据id 查找单个用户
router.get('/:id', function (req, res, next) {
  try {
    User.findById(req.params.id, { password: 0 })
      .then(r => {
        if (r) {
          return res.status(200).json({
            code: CODE.OK,
            data: r,
            msg: '用户信息获取成功'
          })
        }
      })
  } catch (err) {
    next(err)
  }
});

// 根据id 编辑用户信息
router.put('/:id', function (req, res, next) {
  try {
    /***
     * @param new 返回修改后的数据
     */
    User.findByIdAndUpdate(req.params.id, req.body, { "fields": { password: 0 }, "new": true })
      .then(r => {
        // 暂时用着 删除对象属性
        return res.status(200).json({
          code: CODE.OK,
          data: r,
          msg: '修改成功'
        })
      })
  } catch (err) {
    next(err)
  }
});

// 根据id 删除单个用户
router.delete('/:id', function (req, res, next) {
  try {
    User.findByIdAndDelete(req.params.id)
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

// 查找账号是否注册
router.get('/', function (req, res, next) {
  try {
    User.findOne(req.query)
      .then(r => {
        if (r) {
          return res.status(200).json({
            code: CODE.NAME_ERR,
            msg: '账号已存在'
          })
        }
        res.status(200).json({
          code: CODE.OK,
          msg: '账号尚未注册过'
        })
      })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
