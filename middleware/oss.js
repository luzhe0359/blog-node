const OSS = require('ali-oss')
const path = require("path")

const client = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-beijing',
    // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
    accessKeyId: 'LTAI5t8TynLwrvWfaQVqrHtU',
    accessKeySecret: 'MUahRD0wjht2Wc1S6syOtJdtAkHefL',
    // 填写Bucket名称，例如examplebucket。
    bucket: 'zugelu',
});

module.exports = function (filename, classify) {
    return new Promise(async (resolve, reject) => {
        const result = await client.put(`${classify}/${filename}`, path.normalize(path.join(__dirname, '../public/images/', filename)));
        // 200 成功
        if (result.res.statusCode === 200) {
            resolve(result)
        } else {
            reject(result)
        }
    })
}
