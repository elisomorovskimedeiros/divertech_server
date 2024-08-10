var path = require('path');
var fs = require('fs');
const express = require('express'),
bodyParser = require('body-parser'),
cors = require('cors'),
router = require('./controller/router'),
app = express(),
definicoes = require('./model/definicoes'),
methodOverride = require("method-override"); //npm install method-override

porta = definicoes.definicoesExpress.porta;




//Setagem do express
//app.use('/static', express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json({limit: '50mb'}));
app.use(router);


var dir = path.join(__dirname, 'public');

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

app.get('*', function (req, res) {
    var file = path.join(dir, req.path.replace(/\/$/, '/index.html'));
    if (file.indexOf(dir + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});



//Escuta do Express
app.listen(porta, () => {
    console.log(`to na porta ${porta}`);
})
