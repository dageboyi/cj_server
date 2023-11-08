const mysql = require('mysql2')

const connect = mysql.createConnection({
    host: 'database-1.cb4kmmrfdifd.ap-southeast-2.rds.amazonaws.com',
    port: '3306',
    user: 'root',
    password: 'password',
    database: 'voting system'
})

connect.connect(error => {
    if (error) throw error
    console.log(error)
})

module.exports = connect
