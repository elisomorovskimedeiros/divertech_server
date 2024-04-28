var express = require("express");
var router = express.Router();
const Int = require('./Interface');
const cors = require('cors');
var fs = require('fs');
const definicoes = require('../model/definicoes');

router.use(cors());

//requisições de Eventos

router.get('/evento/:id', async(req, res) => {
    let resp = await Int.mostrarEventoPorId(req.params.id);
    res.send({evento: resp});
});

router.get('/ultimoEvento/:idCliente', async(req, res) => {
    console.log(req.params);
    let resp = await Int.mostrarUltimoEventoPorCliente(req.params.idCliente);
    console.log(resp);
    res.send({evento: resp});
});

router.get('/eventos', async(req, res) => {
    let resp = await Int.mostrarProximosEventos();
    res.send({evento: resp});
});

router.get('/eventos/:filtro', async(req, res) => {
    let resp  = await Int.mostrarEventosComFiltro(req.params.filtro);
    res.send({evento: resp});
});

router.get('/evento/:idEvento/brinquedos', async(req, res) => {
    let resp  = await Int.mostrarBrinquedosNoEvento(req.params.idEvento);
    res.send(resp);
});

router.post('/evento', async(req, res) => {    
    let resp = await Int.inserirNovoEvento(req.body);
    res.send({respEvento: resp});
});

router.post('/evento/inserirBrinquedoNoEvento', async(req, res) => {
    let resp = await Int.inserirBrinquedoEmEvento(req.body);
    res.send(resp);
});


//REQUISIÇÕES DE CLIENTES
router.get('/cliente/:id', async(req, res) => {
    let resp = await Int.mostrarClienteComId(req.params.id);
    res.send({cliente: resp});
});

router.get('/clientes', async(req, res) => {
    let resp = await Int.clientesProximos15Dias();    
    res.send({cliente: resp});
});

router.get('/clientes/:filtro', async(req, res) => {
    let resp = await Int.mostrarClientesComFiltro(req.params.filtro);    
    res.send({cliente: resp});
});

router.post('/cliente', async(req, res) => {    
    let resp = await Int.inserirNovoCliente(req.body);
    console.log(resp);
    res.send({respCliente: resp});
});


//REQUISIÇÕES DE BRINQUEDOS
router.get('/brinquedos', async (req, res) => {
    let resp = await Int.mostrarTodosBrinquedos();
    console.log(resp);
    res.send({brinquedo: resp});    
});

router.get('/brinquedos/data/:data', async (req, res) => {
    console.log(req.params.data);
    let resp = await Int.mostrarBrinquedosVagosNaData(req.params.data);
    console.log(resp);
    res.send({brinquedo: resp});
});

router.get("/imagem/:nome", (req, res) => {
    let foto = __dirname+'/../public/imagens/'+ req.params.nome;
    res.download(foto);    
});

router.post('/novoCliente', (req, res) => {
    
})

router.get('/*', (req, res) => {
    res.send({erro: 'Solicitação não encontrada!'});
});


module.exports = router;