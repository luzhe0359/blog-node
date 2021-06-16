
module.exports = function (app) {
    app.use('/api/user', require('./user'));
    app.use('/api/article', require('./article'));
    app.use('/api/category', require('./category'));
    app.use('/api/tag', require('./tag'));
    app.use('/api/comment', require('./comment'));
    app.use('/api/timeline', require('./timeline'));
    app.use('/api/link', require('./link'));
    app.use('/api/album', require('./album'));
    app.use('/api/photo', require('./photo'));
    app.use('/api/*', (req, res, next) => {
        return res.status(200).json('欢迎来到足各路的个人博客。')
    })
};