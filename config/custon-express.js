
var express = require('express')
var consign = require('consign')
var bodyParser = require('body-parser')
var expressValidator = require('express-validator')
// var encrypter = require('object-encrypter');
var cors = require('cors')
var helmet = require('helmet')

module.exports = () => {
  var app = express()
  // app.use(express.static(__dirname + '/public/dist'));
  // desativei as paginas estaticas, para separar os ambientes
  //app.use(serveStatic('public', {'index': 'index.html'}))
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.use(helmet())

  app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": true,
    "optionsSuccessStatus": 204
  }))

  app.use(function (req, res, next) {
    // resposta fake da plataforma, -- segurança
    res.set('X-Powered-By', 'PHP/7')
    next()
  })

  // validador dos dados recebidos
  app.use(expressValidator())
  consign()
    .include('persistencia')
    .then('routes')
    .then('servicos')
    .into(app)
  return app
}
