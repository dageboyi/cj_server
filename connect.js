const mysql = require('mysql2')

const connect = mysql.createConnection({
    host: 'localhost',
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