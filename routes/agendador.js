var moment = require('moment');
moment.locale('pt-br');
var fs = require('fs');
var spawn = require('child_process').spawn;
var schedule = require('node-schedule');
var archiver = require('archiver');
var rimraf = require('rimraf');

module.exports = (app) => {

  // teste
  app.get('/', (req, res) => {
    let bkpDao = new app.persistencia.bkpDao(app.persistencia.connectionFactory())
    bkpDao.lista((erro, resultado) => {
      if (erro) {
        // caso de erro, altero o status para 400 e envio o erro
        res.status(400).send(erro)
      }
      else {
        console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
        let resposta = {
          dados: resultado[0].nome
        }
        res.status(200).json(resposta)
      }
    })
  })

  app.get('/executabkp/:hora/:minuto', (req, res) => {
    // a cada 5 minutos faz o backup
    let hora = req.params.hora;
    let minuto = req.params.minuto;
    console.log('agendei o bkp');
    res.status(200).send('ok')
    

    var j = schedule.scheduleJob({
      hour: hora,
      minute: minuto      
    }, function(){
      console.log('iniciei o faz backup.');
      let dataHoje = moment().format("DD-MM-YYYY");
      let bkpDao = new app.persistencia.bkpDao(app.persistencia.connectionFactory())
      bkpDao.lista((erro, bancos) => {
        console.log('listei os bancos');
        
        if (erro) {
          // caso de erro, altero o status para 400 e envio o erro
          console.log(erro)
        }
        else {

          var contador = 0;
          rimraf('/var/www/temp/*', function () { 
            copiaBanco(bancos, contador)
          });
          
          function copiaBanco(bancos, contador) {
            console.log('iniciei o copiaBanco.');
            
            if (contador <= bancos.length -1) {
              let banco = bancos[contador];
              console.log('copiando o banco '+ banco.nome);
              
              var wstream = fs.createWriteStream(`/var/www/temp/${banco.nome}.sql`);
              var mysqldump = spawn('mysqldump', [
                '-u',
                banco.usuario,
                '-h',
                banco.host,
                '-p' + banco.senha,
                '--databases',
                '--add-drop-database',
                banco.nome
              ]);
              
              mysqldump
                .stdout
                .pipe(wstream)
                .on('finish', function () {
                  console.log('Completed ' + contador);
                  contador++;
                  copiaBanco(bancos, contador);
                  //adiciona linha erro no backup do banco
                })
                .on('error', function (err) {
                  console.log(err, contador)
                  contador++;
                  // adiciona linha sucesso do banco no log
                  copiaBanco(bancos, contador);
                });
            } else {
              console.log('terminei a cópia do banco');
              // envia pro drive, ao terminar, envia email com log do backup

              // limpo a pasta bkps, antes do zip
              rimraf('/var/www/bkps/*', function () { 
                var output = fs.createWriteStream('/var/www/bkps/'+dataHoje+'.zip');
                var archive = archiver('zip');

                output.on('close', function () {
                  var tamanhoArquivo = archive.pointer();        
                  console.log(tamanhoArquivo + ' total bytes');
                  console.log('archiver has been finalized and the output file descriptor has closed.');
                });

                archive.on('error', function(err){
                  throw err;
                });

                archive.pipe(output);
                archive.directory('/var/www/temp', true, { date: new Date() });
                archive.finalize();

                // teste
              });
            }
          }
        }
      })
    });
  })
}
