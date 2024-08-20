var path = require('path');
var express = require("express");
var router = express.Router();
const Int = require('./Interface');
const cors = require('cors');
const upload = require('./Storage');
const definicoes = require('../model/definicoes');

var dir = path.join(`${__dirname}/../`, 'public');

router.use(cors());

//requisições de Eventos

//listar determinado evento pelo seu ID
router.get('/evento/:id', async(req, res) => {
    let resp = await Int.mostrarEventoPorId(req.params.id);
    console.log(resp)
    res.send({evento: resp});
});

//listar o último evento agendado por determinado cliente
router.get('/ultimoEvento/:idCliente', async(req, res) => {
    let resp = await Int.mostrarUltimoEventoPorCliente(req.params.idCliente);
    res.send({evento: resp});
});

//listar eventos dos próximos 15 dias
router.get('/eventos', async(req, res) => {
    let resp = await Int.mostrarProximosEventos();
    res.send({evento: resp});
});

//listar determinado evento
router.get('/eventos/:filtro', async(req, res) => {
    let resp  = await Int.mostrarEventosComFiltro(req.params.filtro);
    
    console.log(resp)
    res.send({evento: resp});
});

//listar brinquedos de detereminado evento
router.get('/evento/:idEvento/brinquedos', async(req, res) => {
    let resp  = await Int.mostrarBrinquedosNoEvento(req.params.idEvento);
    res.send(resp);
});

//inserir novo evento
router.post('/evento', async(req, res) => { 
    let resp = await Int.inserirNovoEvento(req.body);
    res.send({respEvento: resp});
});

//inserir um brinquedo no evento já existente
router.post('/evento/inserirBrinquedoNoEvento', async(req, res) => {
    let resp = await Int.inserirBrinquedoEmEvento(req.body);
    res.send(resp);
});

//#############  editar evento existente #############
//receber objeto contendo parametros do evento e objetos cliente e array de brinquedos
//exemplo:
/* evento = {
    id_evento: 1,
    logradouro_evento: 'Av. X'
    brinquedos: [brinquedo],
    cliente: {cliente}
} */
//objetos cliente tem que ter pelo menos o parâmetro id_cliente e brinquedo pelo menos id_brinquedo
router.put('/evento/:id', async(req, res) => {
    let resp = await Int.editarEventoExistente(req.params.id, req.body);
    res.send(resp);
});

//confirmação ou cancelamento de evento
router.put('/evento/confirmacao/:id', async(req, res) => {
    res.send({status: true, resultado: req.params.id+ '  ' +req.body.status});
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
    res.send(resp);
});

router.put('/cliente/:id_cliente', async(req, res) => {
    let cliente = req.body;
    if(req.params.id_cliente){
        cliente.id_cliente = req.params.id_cliente;
        let resp = await Int.editarCliente(req.body);
        res.send(resp);
    }else{
        res.send({status: false, resultado: 'Faltou o id do cliente.'});
    }
    
});


//REQUISIÇÕES DE BRINQUEDOS
router.get('/brinquedos', async (req, res) => {
    let resp = await Int.mostrarTodosBrinquedos();
    res.send({brinquedo: resp});    
});

router.get('/brinquedos/data/:data', async (req, res) => {
    let resp = await Int.mostrarBrinquedosVagosNaData(req.params.data);
    res.send({brinquedo: resp});
});

router.get("/imagem/:nome", (req, res) => {
    let foto = __dirname+'/../public/imagens/'+ req.params.nome;
    res.download(foto);    
});


router.put('/brinquedo/:id_brinquedo', upload.single('imagem'), async (req, res, next) => {
    let erro = null;
    /*const up = upload.single('imagem');
    up(req, res, function(err){
        if (err instanceof multer.MulterError) {
            console.log('erro de multer')
            console.log(err);
        } else if (err) {
            console.log('erro desconhecido')
            console.log(err);
            // Um erro desconhecido ocorreu durante o upload.
            // Você também pode tratá-lo aqui.
        }

        // Tudo correu bem. Continue para o próximo middleware.
        next();
    })*/
   
    req.file? req.body.foto_brinquedo = req.file.filename: null;
    req.body.id_brinquedo = req.params.id_brinquedo;
    res.send(await Int.editarBrinquedo(req.body));

});

router.post('/brinquedo', upload.single('imagem'), async (req, res) => {
    req.file? req.body.foto_brinquedo = req.file.filename: null;
    res.send(await Int.inserirBrinquedo(req.body));
});


router.get('/*', (req, res) => {
    res.send({erro: 'Solicitação não encontrada!'});
});

module.exports = router;