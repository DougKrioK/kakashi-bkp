var app = require('./config/custon-express')();

var port = process.env.NODEPORT || 3000;
app.listen(port, () => {
  console.log('Servidor rodando na porta ' + port)
});

