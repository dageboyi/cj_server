const express = require('express')
const connect = require('../connect')
const articleRouter = express.Router()

// 添加一个调查
articleRouter.post('/add', (req, res) => {
    const { userId, content, options, time, title } = req.body
    const sql = 'insert into article(userId, content, options, time, title, articleCount) values(?, ?, ?, ?, ?, 0)'
    const userCountSql = 'update users set count = count + 1, voteCount = voteCount + 1 where id = ?'
    const userCountParams = [userId]
    const sqlParams = [userId, content, options, time, title]
    connect.query(sql, sqlParams, (error, result, fields) => {
        if(error) throw error
        connect.query(userCountSql, userCountParams, () => {
            if(error) throw error
            res.send({
                code: 200,
                message: 'Successfully published',
                data: result
            })
        })
    })
})

// 查询自己发布过的调查
articleRouter.post('/list', (req, res) => {
    const { userId, page } = req.body
    const sql = 'select * from article left join users on article.userId = users.id where userId = ?  order by article.articleId desc limit ?,10'
    const sqlCount = 'select count(*) as count from article where userId = ?'
    const sqlCountParams = [userId]
    const sqlParams = [userId, (page - 1) * 10]
    connect.query(sql, sqlParams, (error, result) => {
        if(error) throw error
        connect.query(sqlCount, sqlCountParams, (error, r) => {
            if(error) throw error
            res.send({
                code: 200,
                message: 'query was successful',
                data: result,
                count: r[0].count
            })
        })
    })
})

// 获取详情数据
articleRouter.post('/details', async (req, res) => {
    const { articleId, userId } = req.body
    const sql = 'select * from article left join users on article.userId = users.id where articleId = ?'
    const sqlParams = [articleId]
    connect.query(sql, sqlParams, (error, result) => {
        if(error) throw error
        // 查询当前用户是否投过票
        const isSql = 'select count(*) as count from vote where userId = ? and articleId = ?'
        connect.query(isSql, [userId, articleId], (error, r) => {
            if(error) throw error
            const count = r[0].count
            const counts = []
            const countSql = 'select count(*) as count from vote where `option` = ? and articleId = ?'
            connect.query(countSql, [JSON.parse(result[0].options)[0], articleId], (e, re) => {
                if(error) throw error
                counts.push({ title: JSON.parse(result[0].options)[0], count: re ? re[0].count : 0 })
                connect.query(countSql, [JSON.parse(result[0].options)[1], articleId], (e, ret) => {
                    if(error) throw error
                    counts.push({ title: JSON.parse(result[0].options)[1], count: ret ? ret[0].count : 0 })
                    res.send({
                        code: 200,
                        message: 'query was successful',
                        data: result,
                        count,
                        counts
                    })
                })
            })
        })        
    })
})

// 选择投票
articleRouter.post('/checkoption', (req, res) => {
    const { articleId, option, userId } = req.body
    const sql = 'insert into vote(`option`, articleId, userId) values(?, ?, ?)'
    connect.query(sql, [option, Number(articleId), Number(userId)], (error, result) => {
        connect.query('update users set count = count + 1,answerCount = answerCount + 1 where id = ?', [userId], () => {
            connect.query('update article set articleCount = articleCount + 1 where articleId = ?', [articleId], () => {
                if(error) throw error
                res.send({
                    code: 200,
                    message: 'Voting successful',
                    data: result
                })
            })
        })
        
    })
})

// 已回答
articleRouter.post('/answered', (req, res) => {
    const { userId, page } = req.body
    const sql = 'SELECT * FROM article left join users on article.userId = users.id WHERE articleId in(SELECT articleId FROM vote WHERE userId = ?) ORDER BY article.articleId DESC LIMIT ?, 10'
    connect.query(sql, [userId, (page - 1) * 10], (error, result) => {
        if(error) throw error
        const countSql = 'SELECT COUNT(*) AS count from vote WHERE userId = ?'
        connect.query(countSql, [userId], (e, r) => {
            res.send({
                code: 200,
                message: 'query was successful',
                data: result,
                count: r[0].count ? r[0].count : 0
            })
        })
    })
})

// 未回答的
articleRouter.post('/unanswered', (req, res) => {
    const { userId, page } = req.body
    const sql = 'SELECT * FROM article left join users on article.userId = users.id WHERE articleId not in(SELECT articleId FROM vote WHERE userId = ?) ORDER BY article.articleCount DESC LIMIT ?, 10'
    const sqlCount = 'SELECT COUNT(*) as count FROM article left join users on article.userId = users.id WHERE articleId not in(SELECT articleId FROM vote WHERE userId = ?)'
    connect.query(sql, [userId, (page - 1) * 10], (error, result) => {
        if(error) throw error
        connect.query(sqlCount, [userId], (e, r) => {
            res.send({
                code: 200,
                message: 'query was successful',
                data: result,
                count: r[0].count ? r[0].count : 0
            })
        })
    })
})

// 用户排序
articleRouter.post('/ranking', (req, res) => {
    const { page } = req.body
    const sql = 'SELECT * FROM users ORDER BY count DESC, voteCount DESC,answerCount DESC limit ?, 10'
    connect.query(sql, [(page - 1) * 10], (error, result) => {
        if(error) throw error
        connect.query('SELECT count(*) as count FROM users', (e, r) => {
            if(error) throw error
            res.send({
                code: 200,
                message: 'query was successful',
                data: result,
                count: r[0].count ? r[0].count : 0
            })
        })
    })
})

module.exports = articleRouter