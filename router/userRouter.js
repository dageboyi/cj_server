const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const connect = require('../connect')
const md5 = require('md5')
const userRouter = express.Router()
const secret = 'vote' //自定义密钥

const storage = multer.diskStorage({
    // 上传文件的目录
    destination: function(req, file, cb){
        cb(null, 'public/images')
    },
    // 上传文件的名称
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

// 登录
userRouter.post('/login', (req, res) => {
    const { username, password } = req.body

    const sql = 'select * from users where username=?'
    const sqlParams = [username]
    connect.query(sql, sqlParams, (error, result, fields) => {
        if(error) {
            res.send({
                code: 500,
                message: 'Login failed',
                data: result
            })
        } else {
            if(result.length === 0) {
                res.send({
                    code: 500,
                    message: 'user does not exist',
                    data: result
                })
            } else {
                const token = jwt.sign({id: result[0].id,username, password: md5(password)}, secret, {expiresIn: 3600 * 24})
                if(result[0].password === md5(password)) {
                    const temp = {
                        id: result[0].id,
                        username: result[0].username,
                        sex: result[0].sex,
                        avatar: result[0].avatar
                    }
                    res.send({
                        code: 200,
                        message: 'Login succeeded',
                        data: temp,
                        token
                    })
                } else {
                    res.send({
                        code: 500,
                        message: 'Password error',
                        data: result
                    })
                }
            }
        }
    })
})

userRouter.post('/token', (req, res) => {
    const { token } = req.body
    const verifyToken = jwt.verify(token, secret)
    res.send({
        code: 200,
        message: 'query was successful',
        data: JSON.parse(verifyToken.id)
    })
})

// 注册
userRouter.post('/register', (req, res) => {
    const { username, password, sex } = req.body
    const countSql = 'select count(*) as count from users where username=?'
    const countSqlParams = [username]
    connect.query(countSql, countSqlParams, (error, r, fields) => {
        if(r[0].count === 0) {
            const sql = 'insert into users(username, password, sex, avatar, count, voteCount, answerCount) values(?, ?, ?, ?, 0, 0, 0)'
            const avatar = sex === 'male' ? '/api/images/default.webp' : '/api/images/mary.webp'
            const sqlParams = [username, md5(password), sex, avatar]
            connect.query(sql, sqlParams, (error, result, fields) => {
                if(error) {
                    res.send({
                        code: 500,
                        message: 'login has failed',
                        data: result
                    })
                } else {
                    res.send({
                        code: 200,
                        message: 'login was successful',
                        data: result
                    })
                }
            })
        } else {
            res.send({
                code: 500,
                message: 'Account already exists',
                data: null
            })
        }
    })
})

// 页面刷新重新请求数据接口
userRouter.post('/init', (req, res) => {
    const { id } = req.body
    const sql = 'select * from users where id=?'
    const sqlParams = [id]
    connect.query(sql, sqlParams, (error, result, fields) => {
        if(error) throw error
        const temp = {
            id: result[0].id,
            username: result[0].username,
            sex: result[0].sex,
            avatar: result[0].avatar
        }
        res.send({
            code: 200,
            message: 'query was successful',
            data: temp
        })
    })
})

// 头像
userRouter.post('/avatar', upload.single('file'), (req, res) => {
    const { userId } = req.body
    connect.query('update users set avatar = ? where id = ?', ['/api/images/' + req.file.filename, userId], (error, result) => {
        res.send({
            code: 200,
            message: 'Upload successful',
            data: '/api/images/' + req.file.filename
        })
    })
    
})

module.exports = userRouter

