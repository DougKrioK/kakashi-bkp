function bkpDao (connection) {
  this._connection = connection
}
// lista
bkpDao.prototype.lista = function (callback) {
  this._connection.query('SELECT * FROM bancos', callback)
  this._connection.end()
}

module.exports = function () {
  return bkpDao
}
