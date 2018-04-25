var express = require('express');
var bodyParser = require('body-parser');
var multiParty = require('connect-multiparty');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectID;
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded( { extended: true } ));
app.use(bodyParser.json());
app.use(multiParty());

app.use(function(req, res, next) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);

    next();
});

var port = 8080;

app.listen(8080);

var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);

app.get('/', function(req, res) {
    res.send({ msg: 'Olá' });
});

app.post('/api', function(req, res) {
    var date = new Date();
    var time_stamp = date.getTime();

    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;
    
    var pathOrigem = req.files.arquivo.path;
    var pathDestino = './uploads/' + url_imagem;

    fs.rename(pathOrigem, pathDestino, function(err) {
        if(err) {
            res.status(500).json({ error: err });
            return;
        }

        var dados = {
            url_imagem: url_imagem,
            titulo: req.body.titulo
        }

        db.open( function(err, mongoclient) {
            mongoclient.collection('postagens', function(err, collection) {
                collection.insert(dados, function(err, records) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                });
            })
        });
    });
});

app.get('/api', function(req, res) {
    db.open( function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.find().toArray(function(err, results) {
                if(err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        })
    });
});

app.get('/api/:id', function(req, res) {
    db.open( function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.find(objectId(req.params.id)).toArray(function(err, results) {
                if(err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        })
    });
});

app.get('/imagens/:imagem', function(req, res) {
    var img = req.params.imagem;

    fs.readFile('uploads/' + img, function(err, conteudo) {
        if(err) {
            res.status(400).json(err);
            return;
        }

        res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(conteudo);
    });
});

app.put('/api/:id', function(req, res) {
    db.open( function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.update(
                { _id: objectId(req.params.id) },
                { $push: {
                    comentarios: {
                        id_comentario: new objectId(),
                        comentario: req.body.comentario
                        }
                    } 
                },
                {  },
                function(err, records) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }

                    mongoclient.close();
                }
            );
        })
    });
});

app.delete('/api/:id', function(req, res) {
    db.open( function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.update(
                {  },
                { $pull: {
                    comentarios: { id_comentario: objectId(req.params.id) }
                    } 
                },
                { multi: true },
                function(err, records) {
                    if(err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    
                    mongoclient.close();
                }
            );
        })
    });
});