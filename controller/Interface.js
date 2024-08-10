const Db = require('./Db');
const Evento = require('../model/Evento');
const Cliente = require('../model/Cliente');
const Brinquedo = require('../model/Brinquedo');
const { selectPorNomeCliente, selectPorDataEspecifica, selectPorIntervaloDeData } = require('../model/Evento');
db = new Db();

function jsonBrinquedosToArrayBrinquedos(eventos){
    if(eventos.length > 0 ){
        eventos.forEach((evento) => {
            if(evento.hasOwnProperty('brinquedos')){                
                try {
                    evento.brinquedos && (evento.brinquedos = evento.brinquedos.replace(/(\r\n\t|\n|\r|\t)/gm, ""));
                    evento.brinquedos = JSON.parse(evento.brinquedos);
                } catch (error) {
                    evento.brinquedos = [{error: 'Não foi possível obter os brinquedos desse evento'}];
                }
            }
        });
    }
    return eventos;
}

let Interface = {
    //Eventos
    mostrarEventoPorId: async(id) => {
        let res = null;
        if(!isNaN(id)){
            res = await Evento.selectPorId(id);
        }else{
            res = await Evento.selectPorNomeCliente(id);
        }
        return jsonBrinquedosToArrayBrinquedos(res.resultado);
    },

    mostrarUltimoEventoPorCliente: async(idCliente) => {
        let res = await Evento.selectUltimoEventoPorCliente(idCliente);
        return jsonBrinquedosToArrayBrinquedos(res.resultado);
    },

    mostrarBrinquedosNoEvento: async(idEvento) => {
        let res = await Evento.mostrarBrinquedosNoEvento(idEvento);
        return(res);
    },

    mostrarEventosComFiltro: async(filtro) => {  
        let resultado; 
        //busca por nome de cliente:
        if(filtro.length > 2 && isNaN(filtro)){
            if(filtro.indexOf('dataDe') >= 0){
                let datas = JSON.parse(filtro);
                if(datas.dataDe === "" || datas.dataAte === ""){
                    resultado = (await selectPorDataEspecifica(datas.dataAte)).resultado;
                }else{
                    resultado = (await selectPorIntervaloDeData(datas)).resultado; 
                }                               
            }else{
            resultado = (await selectPorNomeCliente(filtro)).resultado;
            }    
        }else{
            resultado = (await Evento.selectPorId(filtro)).resultado;
            console.log(resultado);
        }
        if(resultado.length < 1){
            return null;
        }else{
            return jsonBrinquedosToArrayBrinquedos(resultado);
        }
        
    },

    mostrarProximosEventos: async() => {
        let res = await Evento.selectProximos15Dias();
        return jsonBrinquedosToArrayBrinquedos(res.resultado);
    },

    inserirNovoEvento: async(dadosDoEvento) => {
        let {evento, cliente, brinquedos} = dadosDoEvento, resp = null, idEventoInserido = null;
        if(evento.valor_desconto === '') evento.valor_desconto = 0 ;
        if(evento.valor_sinal === '') evento.valor_sinal = 0 ;
        if(evento.valor_total === '') evento.valor_total = 0 ;
        if(cliente.id_cliente){
            resp = await Evento.inserirNovoEvento(dadosDoEvento);
            if(resp.status){
                idEventoInserido = resp.resultado.insertId;
                resp = await Evento.inserirBrinquedosNoEvento(idEventoInserido, brinquedos);
                if(resp.status){
                    return {status: true, resultado: idEventoInserido};
                }else{
                    resp.resultado = resp.resultado.sqlMessage.split("/.");
                    return(resp.resultado[0]);
                }
            }

        }else{
            resp = ({erro: 'cliente ainda não inserido'});
        }
        return resp;
    },

    inserirBrinquedoEmEvento: async(dados) => {
        if(dados.hasOwnProperty('idBrinquedo') && dados.hasOwnProperty('idEvento')){
            let {idBrinquedo, idEvento} = dados;
            let estaVago = await Evento.verificarSeBrinquedoEstaVago(idBrinquedo,idEvento);
            if(estaVago){
                return await Evento.inserirBrinquedosNoEvento(idEvento, [{id_brinquedo: idBrinquedo}]);
            }else{
                return {erro: 'O brinquedo não está vago'};
            }
        }else{
            return {erro: "Ocorreu um erro na comunicação dos dados do evento"};
        }
       
    },

    //Clientes
    mostrarClienteComId: async(id) => {
        console.log(id);
        if(isNaN(id)){
            
            return await Cliente.selectPorNome(id);
        }else{ //solicitação de cliente via id
           
            return await Cliente.selectPorId(id);
        }
    },

    clientesProximos15Dias: async() => {
        return await Cliente.selectClientesProximos15Dias();
    },

    mostrarClientesComFiltro: async(filtro) => {
        //solicitação com filtro mais detalhado
        //[0]: cpf
        //[1]: nome
        //[2]: logradouro
        //[3]: cidade
        //[4]: data de algum evento do cliente
        const infFiltro = filtro.split(',');
        return await Cliente.selectPesquisaDetalhada(infFiltro);
    },

    inserirNovoCliente: async(cliente) => {
        let resp = null;
        if(cliente.nome === '' ||
            cliente.cpf === '' ||
            cliente.logradouro === '' ||
            cliente.bairro === '' ||
            cliente.cidade === '' ||
            cliente.telefone === ''){
            resp = ({erro: 'Existem dados obrigatórios que vieram vazios.'});     
        }else{
            resp = await Cliente.inserirNovoCliente(cliente);
        }
        return resp;
    },
    
    editarCliente: async(cliente) => {
        let resp = await Cliente.editarCliente(cliente);
        return resp;
    },

    //Brinquedos
    mostrarTodosBrinquedos: async() => {
        return await Brinquedo.selectTodosBrinquedos();
    },
    mostrarBrinquedosVagosNaData: async(data) => {
        /*
        let listaDeTodosOsBrinquedos = await Brinquedo.selectTodosBrinquedos();
        let listaDeBrinquedosReservadosParaData = await Brinquedo.selectIdBrinquedosNaData(data);
        let listaDeBrinquedosVagos = {};
        if (listaDeTodosOsBrinquedos.status && listaDeBrinquedosReservadosParaData.status){
            listaDeTodosOsBrinquedos.resultado.map((brinquedo) => {
                listaDeBrinquedosReservadosParaData.resultado.map((brinquedoReservado) => {
                    if(brinquedo.id_brinquedo === brinquedoReservado.id_brinquedo){
                        brinquedo.quantidade--;
                    }
                });
            });
            
        }*/
        return await Brinquedo.informarBrinquedosVagosNaData(data);
    },
    editarBrinquedo: async (brinquedo) => {
        return await Brinquedo.editarBrinquedo(brinquedo);        
    },
    inserirBrinquedo: async (brinquedo) => {
        return await Brinquedo.inserirBrinquedo(brinquedo);
    },
    editarEventoExistente: async (id_evento, evento) => {
        let brinquedos = null;
        if(evento.hasOwnProperty('cliente')){
            evento.id_cliente = evento.cliente.id_cliente;
            delete evento.cliente;
        }
        if(evento.hasOwnProperty('brinquedos')){
            brinquedos = evento.brinquedos;
            delete evento.brinquedos;
        }
        if(evento.hasOwnProperty('abrigo')){
            evento.possui_local_abrigado = evento.abrigo;
            delete evento.abrigo;
        }
        if(evento.hasOwnProperty('logradouro_evento')){
            evento.logradouro = evento.logradouro_evento;
            delete evento.logradouro_evento;
        }
        if(evento.hasOwnProperty('bairro_evento')){
            evento.bairro = evento.bairro_evento;
            delete evento.bairro_evento;
        }
        if(evento.hasOwnProperty('cidade_evento')){
            evento.cidade = evento.cidade_evento;
            delete evento.cidade_evento;
        }
        if(evento.hasOwnProperty('data_evento')){
            evento.data = evento.data_evento;
            delete evento.data_evento;
        }
        if(evento.hasOwnProperty('numero_evento')){
            evento.numero = evento.numero_evento;
            delete evento.numero_evento;
        }
        if(evento.hasOwnProperty('observacao_endereco_evento')){
            evento.observacao = evento.observacao_endereco_evento;
            delete evento.observacao_endereco_evento;
        }
        let res = await Evento.editarEvento(id_evento, evento);
        if(res.status && brinquedos){
            res = await Evento.deletarBrinquedosNoEvento(id_evento);
            if(res.status){
                res = await Evento.inserirBrinquedosNoEvento(id_evento, brinquedos);
            }
        }
        return await res;
    }
}

module.exports = Interface;
