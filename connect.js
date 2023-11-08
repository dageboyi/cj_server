const mysql = require('mysql')

const connect = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'jc',
    database: 'voting system'
})

connect.connect(error => {
    if (error) throw error
    console.log(error)
})

module.exports = connect