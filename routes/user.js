const express = require('express');
const router = express.Router();
const sha256 = require("crypto-js/sha256");

const User = require('../models/user')
const { CRYPTO_KEY, CODE } = require('../config/config')
const { aesDecrypt } = require('../middleware/crypto');
const { jwtEncrypt, jwtDecrypt, getToken, getUserInfo } = require('../middleware/jwt');
const { set, remove } = require('../middleware/redis');


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
    let user = await User.findOne(body)
    if (!user) {
      return res.status(200).json({
        code: CODE.USER_ERR,
        msg: '用户名或密码错误!'
      })
    }

    const userInfo = JSON.parse(JSON.stringify(user)); // 深拷贝，用户信息
    delete userInfo.password // 删除密码，保存密码至token过于敏感
    // 生成 token
    const token = jwtEncrypt(userInfo)
    // 保存至redis
    set(userInfo._id, token)

    return res.status(200).json({
      code: CODE.OK,
      data: {
        token,
        user
      },
      msg: '登录成功'
    })
  } catch (err) {
    next(err)
  }
})

// 用户退出
router.post('/logout', async (req, res, next) => {
  try {
    let userInfo = getUserInfo(req.headers)
    if (userInfo && !!await remove(userInfo._id)) { // 1 退出成功
      return res.status(200).json({
        code: CODE.OK,
        msg: '退出成功'
      })
    } else {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '退出失败'
      })
    }
  } catch (err) {
    next(err)
  }
})

// 添加用户
router.post('/add', async (req, res, next) => {
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
router.post('/', async (req, res, next) => {
  const body = req.body
  try {
    // 用户名、昵称 模糊查询
    let username = body.username || ''
    let nickname = body.nickname || ''
    let filter = {} // 定义查询条件
    username && (filter.username = { $regex: new RegExp(username || '', 'i') })
    nickname && (filter.nickname = { $regex: new RegExp(nickname || '', 'i') })
    let select = { // 规定不返回的字段
      password: 0
    }

    // 总数
    const total = await User.countDocuments(filter)
    // 分页逻辑
    let pageNum = parseInt(body.pageNum) || 1 // 页码
    let limit = body.pageSize === 0 ? total : parseInt(body.pageSize) || 10 // 每页条数 (0 获取所有)
    let skip = (pageNum - 1) * limit // 跳过多少条
    let sort = {} // 排序
    sort[body.sortBy || 'createTime'] = body.descending ? 1 : -1

    const r = await User.find(filter)
      .select(select) // 过滤展示字段
      .sort(sort) // 排序
      .skip(skip) // 跳过多少条
      .limit(limit) // 每页多少条

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '用户列表获取成功',
      pageNum: pageNum,
      pageSize: limit,
      sortBy: body.sortBy,
      total: total
    })
  } catch (err) {
    next(err)
  }
});

// 根据_id 查找单个用户
router.get('/:_id', async (req, res, next) => {
  try {
    const r = await User.findById(req.params._id, { password: 0 })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '用户信息获取成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据id 编辑用户信息
router.put('/:id', async (req, res, next) => {
  try {
    /***
     * @param new 返回修改后的数据
     */
    const r = await User.findByIdAndUpdate(req.params.id, req.body, { "fields": { password: 0 }, new: true })

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
});

// 根据id 删除单个用户
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await User.findByIdAndDelete(req.params.id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

// 查找账号是否注册
router.get('/', async (req, res, next) => {
  try {
    const r = await User.findOne(req.query)
    if (r) {
      return res.status(200).json({
        code: CODE.ACCOUNT_ERR,
        msg: '账号已存在'
      })
    }
    res.status(200).json({
      code: CODE.OK,
      msg: '账号尚未注册过'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
