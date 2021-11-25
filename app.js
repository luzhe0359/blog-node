const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const expressJWT = require('express-jwt');
const history = require('connect-history-api-fallback');

const { refreshToken } = require('./middleware/jwt');

// config
const { CRYPTO_KEY, CODE, ROUTE_WHITE_LIST, CORS_WHITE_LIST } = require('./config');
const { log } = require('debug');

const app = express();
// 启用gzip
app.use(compression())

// 利用正则来匹配地址，打开对应的index页面，同时实现部署多个vue项目
app.use(history(
  {
    rewrites: [{ from: /^\/react/, to: '/react/index.html' },],
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
  },
  {
    rewrites: [{ from: /^\/admin/, to: '/admin/index.html' },],
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
  },
  {
    rewrites: [{ from: /^\//, to: '/dist/template.html' },],
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
  },
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ limit: '20mb', extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'react')));
// app.use('/', express.static(path.join(__dirname, 'dist')));
app.use('/admin', express.static(path.join(__dirname, 'admin'))); // 后台管理
app.use('/react', express.static(path.join(__dirname, 'react'))); // 前台react
app.use(cookieParser());

// 配置body-parser,只要加入这个配置，则在req请求对象上会多出来一个属性：body
// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false })) //extended:false 不使用第三方模块处理参数，使用Nodejs内置模块querystring处理
// parse application/json
app.use(bodyParser.json())

// cors 跨域解决
app.use(
  cors({
    origin: CORS_WHITE_LIST, // 跨域白名单
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    alloweHeaders: ['Conten-Type', 'Authorization', 'Content-Length', 'Accept', 'X-Requested-With', "Access-Control-Allow-Origin", "*"],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

// 校验token，获取headers⾥里里的Authorization的token，要写在路由加载之前，静态资源之后
app.use(expressJWT({
  // 加密时所用的密匙
  secret: CRYPTO_KEY,
  // 设置算法
  algorithms: ['HS256'],
}).unless({ // jwt设置需要保护的API
  path: ROUTE_WHITE_LIST //除了这几个地址，其他都需要jwt验证
}));
// 每一次请求都刷新token的过期时间
app.use(refreshToken)

// 路由
require('./routes')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError' && err.message === 'No authorization token was found') { // 无token的err值
    return res.status(200).json({
      code: CODE.TOKEN_INVALID,
      msg: 'No authorization token was found ...'
    });
  } else if (err.name === 'UnauthorizedError' && err.message === 'invalid token') { // token无效的err值
    return res.status(200).json({
      code: CODE.TOKEN_INVALID,
      msg: 'invalid token ...'
    });
  } else if (err.name === 'UnauthorizedError' && err.message === 'jwt expired') { // token过期时的err值
    return res.status(200).json({
      code: CODE.TOKEN_EXPIRED,
      msg: 'expired token ...'
    });
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
