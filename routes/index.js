
module.exports = function (app) {
    app.use('/user', require('./user'));
    app.use('/article', require('./article'));
    app.use('/category', require('./category'));
    app.use('/tag', require('./tag'));
    app.use('/comment', require('./comment'));
    app.use('/timeline', require('./timeline'));
    app.use('/link', require('./link'));
    app.use('/album', require('./album'));
    app.use('/photo', require('./photo'));
    app.use('/*', (req, res, next) => {
        return res.status(200).json('欢迎来到足各路的个人博客。')
    })
};