var mysql = require('mysql')

function createDBConnection () {
  return mysql.createConnection({
    host: process.env.hostDB || '127.0.0.1',
    port: process.env.portDB || '3306',
    user: process.env.userDB || 'bkpbancos',
    password: process.env.passwordDB || 'bkpBancos',
    database: process.env.databaseDB || 'bkpBancos',
    dateStrings: true,
    supportBigNumbers: true
  })
}

module.exports = function () {
  return createDBConnection
}
