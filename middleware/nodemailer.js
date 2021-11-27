const path = require('path');
const fs = require('fs');
const nodemailer = require("nodemailer");
const moment = require('moment');
const ejs = require("ejs");
const { NODEMAILER_AUTH_PASS } = require('../config')

let transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "luzhe0359@163.com", // generated ethereal user
        pass: NODEMAILER_AUTH_PASS, // generated ethereal password
    },
});

function randomSixNumber () {
    let numbers = "";
    for (let i = 0; i < 6; i++) {
        numbers += Math.floor(Math.random() * 10);
    }
    return numbers
}

module.exports = function (email, username) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, '../views', '/register.ejs'), 'utf8', async function (err, data) {
            if (err) {
                reject(err)
            }
            const currentTime = moment().format("YYYY-MM-DD HH:mm:ss"); //当前时间
            const randomNumber = randomSixNumber() // 随机6位数
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '<luzhe0359@163.com>', // sender address
                to: email, // list of receivers
                subject: "足各路-邮箱验证 ✔", // Subject line
                text: "验证码获取失败，请再次尝试。", // plain text body
                html: ejs.render(data, { code: randomNumber, username, currentTime })
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            info.randomNumber = randomNumber
            resolve(info)
        });

    }).catch(err => {
        console.log(err);
    })
}
