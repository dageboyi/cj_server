const express = require('express')
const cors = require('cors');

const userRouter = require('./router/userRouter')
const articleRouter = require('./router/articleRouter')
const bodyparser = require('body-parser')
const path = require('path')

const app = express()
app.use(cors());
app.use(bodyparser.json())
app.use('/', userRouter)
app.use('/article', articleRouter)
app.use(express.static(path.join(__dirname, 'public')))

app.listen(8080, () => {
    console.log('Project started successfully')
})

