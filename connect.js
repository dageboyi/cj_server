const mysql = require('mysql')

const connect = mysql.createConnection({
    host: 'bscqmjc4ysrlserxjroq-mysql.services.clever-cloud.com',
    port: '3306',
    user: 'uykzpsxgtd5qenug',
    password: 'RUlce9PGjptuAIh0fXMU',
    database: 'bscqmjc4ysrlserxjroq'
})

connect.connect(error => {
    if (error) throw error
    console.log(error)
})

module.exports = connect
