const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const sha256 = require("crypto-js/sha256");

const User = require('../models/user')
const { CRYPTO_KEY, CODE } = require('../config')
const { aesDecrypt } = require('../middleware/crypto');
const { jwtEncrypt } = require('../middleware/jwt');
const { set, get, remove } = require('../middleware/redis');
const sendEmail = require('../middleware/nodemailer');


// 用户登录
router.post('/login', async (req, res, next) => {
  const { admin = '' } = req.headers
  let { password, account } = req.body
  try {
    // 获取初始密码
    let encryptPassword = aesDecrypt(password)
    // 对初始密码、进行不可逆加密
    let decryptPassword = sha256(encryptPassword + CRYPTO_KEY).toString()
    let userinfo = {
      $or: [{ username: account }, { email: account }], // 用户名或密码正确
      password: decryptPassword
    }
    // 查找用户
    let user = await User.findOne(userinfo).select({ password: 0 })
    if (!user) {
      return res.status(200).json({
        code: CODE.USER_ERR,
        msg: '账号或密码错误!'
      })
    }
    if (admin && user.role === "blacklist") {
      return res.status(200).json({
        code: CODE.ROLE_ERR,
        msg: '您已被列入黑名单，详情请联系管理员!'
      })
    }
    if (admin && "super,admin,editor".indexOf(user.role) == -1) {
      return res.status(200).json({
        code: CODE.ROLE_ERR,
        msg: '权限不足，请联系管理员!'
      })
    }

    // 生成 token (The user you are using is a returned user from mongoose so you will need to use USER.toJSON.)
    const token = jwtEncrypt(user.toJSON())
    // 保存至redis
    set(user._id.toString(), token)

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
  const { _id } = req.user // 用户_id
  try {
    if (_id) {
      await remove(_id)
      return res.status(200).json({
        code: CODE.OK,
        msg: '退出成功'
      })
    } else {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '您未登录'
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
    let hasCode = await get(body.email)
    // 验证码存在，且与传来的值相等
    if (!hasCode || hasCode !== body.code) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '验证码错误'
      })
    }
    // 获取初始密码
    let encryptPassword = aesDecrypt(body.password)
    // 对初始密码、进行不可逆加密
    let decryptPassword = sha256(encryptPassword + CRYPTO_KEY).toString();
    body.password = decryptPassword
    // 创建用户，执行注册
    await new User(body).save()
    // 移除验证码
    await remove(body.email)

    res.status(200).json({
      code: CODE.OK,
      msg: '注册成功'
    })
  } catch (err) {
    next(err)
  }
});

// 邮件验证码
router.post('/code', async (req, res, next) => {
  let { email, username } = req.body
  try {
    let info = await sendEmail(email, username)
    // 保存至redis
    set(email, info.randomNumber, 600)
    return res.status(200).json({
      code: CODE.OK,
      msg: '发送成功'
    })
  } catch (err) {
    next(err)
  }
})

// 修改密码
router.post('/password', async (req, res, next) => {
  let { email, password, code } = req.body
  try {
    let hasCode = await get(email)
    // 验证码存在，且与传来的值相等
    if (!hasCode || hasCode !== code) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '验证码错误'
      })
    }
    // 获取新密码的初始密码
    let encryptPassword = aesDecrypt(password)
    // 对新密码的初始密码、进行不可逆加密
    let decryptPassword = sha256(encryptPassword + CRYPTO_KEY).toString();

    let oldUserInfo = await User.find({ email });
    if(!oldUserInfo.length) {
      return res.status(200).json({
        code: CODE.OTHER_ERR,
        msg: '邮箱不存在'
      })
    }

    oldUserInfo = oldUserInfo[0]
    oldUserInfo.password = decryptPassword
    const r = await User.findByIdAndUpdate(oldUserInfo._id, oldUserInfo, { "fields": { password: 0 }, new: true })
    // 移除验证码
    await remove(email)

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '修改成功'
    })
  } catch (err) {
    next(err)
  }
})

// 校验用户名
router.post('/username', async (req, res, next) => {
  let { username } = req.body
  try {
    const u = await User.findOne({ username })
    if (u) {
      return res.status(200).json({
        code: CODE.OK,
        data: 'Username has been used',
        msg: '账号已存在'
      })
    }

    res.status(200).json({
      code: CODE.OK,
      data: '',
      msg: '账号可以注册'
    })
  } catch (err) {
    next(err)
  }
});

// 校验昵称
router.post('/nickname', async (req, res, next) => {
  let { nickname } = req.body
  try {
    const u = await User.findOne({ nickname })
    if (u) {
      return res.status(200).json({
        code: CODE.OK,
        data: 'Nickname has been used',
        msg: '昵称已存在'
      })
    }

    res.status(200).json({
      code: CODE.OK,
      data: '',
      msg: '昵称可以使用'
    })
  } catch (err) {
    next(err)
  }
});

// 校验邮箱
router.post('/email', async (req, res, next) => {
  let { email } = req.body
  try {
    const u = await User.findOne({ email })
    if (u) {
      return res.status(200).json({
        code: CODE.OK,
        data: 'Email has been used',
        msg: '邮箱已被使用'
      })
    }

    res.status(200).json({
      code: CODE.OK,
      data: '',
      msg: '邮箱可以使用'
    })
  } catch (err) {
    next(err)
  }
});

// 查找用户列表
router.get('/list', async (req, res, next) => {
  const { username = '', nickname = '', pageNum = 1, pageSize = 10, sortBy = 'createTime', descending = 1 } = req.query
  try {
    // 查询条件
    let filter = {}
    // 模糊查询
    username && (filter.username = { $regex: new RegExp(username || '', 'i') })
    nickname && (filter.nickname = { $regex: new RegExp(nickname || '', 'i') })
    let select = { // 规定不返回的字段
      password: 0
    }

    // 总数
    const total = await User.countDocuments(filter)
    // 分页逻辑
    let limit = pageSize === 0 ? total : parseInt(pageSize) // 每页条数 (0 获取所有)
    let skip = (pageNum - 1) * limit // 跳过多少条
    let sort = {} // 排序
    sort[sortBy] = parseInt(descending)

    const r = await User.find(filter)
      .select(select) // 过滤展示字段
      .sort(sort) // 排序
      .skip(skip) // 跳过多少条
      .limit(limit) // 每页多少条

    return res.status(200).json({
      code: CODE.OK,
      data: r,
      msg: '用户列表获取成功',
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

// 根据_id 查找单个用户
router.get('/:_id', async (req, res, next) => {
  try {
    const r = await User.findById(req.user._id, { password: 0 })

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
router.put('/:_id', async (req, res, next) => {
  const { avatar } = req.body
  try {
    if (avatar) {
      // 找到旧头像、并删除
      const oldUserInfo = await User.findById(req.params._id, { password: 0 })
      if (avatar !== oldUserInfo.avatar) {
        const oldAvatarUrl = path.resolve(__dirname, '../public', '.' + oldUserInfo.avatar)

        // 检查头像是否存在
        fs.access(oldAvatarUrl, fs.constants.F_OK, (err) => {
          // console.log(`${oldAvatarUrl} ${err ? '不存在' : '存在'}`);
          if (!err) {
            fs.unlinkSync(oldAvatarUrl)
          }
        });
      }
    }

    /***
     * @param new 返回修改后的数据
     */
    const r = await User.findByIdAndUpdate(req.params._id, req.body, { "fields": { password: 0 }, new: true })
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
router.delete('/:_id', async (req, res, next) => {
  try {
    const r = await User.findByIdAndDelete(req.params._id)

    return res.status(200).json({
      code: CODE.OK,
      msg: '删除成功'
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
