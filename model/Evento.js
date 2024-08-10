const Db = require('../controller/Db');
const Brinquedo = require('./Brinquedo');
//const db = new Db();

let horaDoEvento = ' 00:00:0000 ';
let statusEventoNovo = 0;

const queryDeBuscaEvento = () => {
    let busca_brinquedo = "concat('[',GROUP_CONCAT(COALESCE(CONCAT('{\"id_brinquedo\":\"', brinquedo.id_brinquedo, '\", \"nome\":\"', brinquedo.nome_brinquedo, '\", \"imagem\":\"',brinquedo.foto_brinquedo,'\"}'),'')),']') ";
    let sql = "SELECT evento.bairro as bairro_evento, evento.cidade as cidade_evento, evento.complemento as complemento_evento, "+
    "DATE_FORMAT(evento.data,'%d/%m/%Y') AS data_evento, evento.id_evento as id_evento, evento.logradouro as logradouro_evento, "+
    "evento.numero as numero_evento, evento.observacao as observacao_endereco_evento, evento.observacao_evento as observacao_evento, "+
    "evento.valor_desconto, evento.valor_sinal, evento.valor_total, evento.possui_local_abrigado as abrigo, evento.status,"+
    "cliente.bairro as bairro_cliente, cliente.cidade as cidade_cliente, cliente.complemento as complemento_endereco_cliente, "+
    "cliente.email, cliente.id_cliente, cliente.logradouro as logradouro_cliente, cliente.nome as nome_cliente, "+
    "cliente.numero as numero_cliente, cliente.observacao_endereco as observacao_endereco_cliente, cliente.telefone, cliente.telefone_recado, "+
    
    busca_brinquedo +
    "as brinquedos FROM brinquedo " +
    "right join evento_brinquedo on brinquedo.id_brinquedo = evento_brinquedo.brinquedo "+
    "right join evento on evento_brinquedo.evento = evento.id_evento "+
    "right join cliente on evento.id_cliente = cliente.id_cliente ";
    return sql;
}

const queryInsercaoEvento = (dadosDoEvento) => {
    const {evento, cliente, brinquedos} = dadosDoEvento;
    const query = "INSERT INTO evento (id_cliente, data,"+
    "logradouro, numero, complemento, observacao, bairro, cidade, valor_total, valor_desconto, "+
    "valor_sinal, observacao_evento, status) VALUES "+
    "('"+ cliente.id_cliente + "', '" + evento.data + horaDoEvento + "', '" +evento.logradouro + "', " + 
    evento.numero + ", '" + evento.complemento + "' , '" + evento.observacao_endereco + "', '"+
    evento.bairro + "', ' " + evento.cidade + "', " + evento.valor_total + ", " + evento.valor_desconto + ", "+
    evento.valor_sinal + ", '" + evento.observacao_evento + "', " + statusEventoNovo + ")";

    return query;
}

const queryInserirBrinquedosNoEvento = (id_evento, brinquedos) => {
    let query = "INSERT INTO evento_brinquedo (brinquedo, evento) VALUES ";
    brinquedos.forEach((brinquedo, indice) => {
        query = query + "(" + String(brinquedo.id_brinquedo) + ", " + String(id_evento) + ")";
        if(!(brinquedos.length - 1 === indice)){
            query = query + ", ";
        }
    });
    
    return query;
}

const queryDataEvento = async (id_evento) => {
    let query = "SELECT DATE_FORMAT( data, '%Y-%c-%d' ) AS data FROM evento WHERE id_evento like ?";
    let resultado = await db.consultarDb(query, id_evento);
    return resultado;
}

const Evento = {
    selectPorId: async(id) => {
        let query = queryDeBuscaEvento() + ' WHERE evento.id_evento LIKE ?';
        let resultado = db.consultarDb(query, id);
        return resultado;        
    },

    selectProximos15Dias: async() => {
        let filtroProximos15Dias = "where evento.data BETWEEN CURDATE() AND CURDATE() + INTERVAL 15 DAY "+ 
        "group by evento.id_evento "+
        "order by evento.data asc";
        
        let query = queryDeBuscaEvento() + filtroProximos15Dias;
        let res = await db.consultarDb(query);
        return res;
    },

    mostrarBrinquedosNoEvento: async(idEvento) => {
        let query = "SELECT foto_brinquedo from brinquedo " +
            "JOIN evento_brinquedo ON brinquedo.id_brinquedo = evento_brinquedo.brinquedo " +
            "WHERE evento_brinquedo.evento = ?";
        return await db.consultarDb(query, idEvento);
    },

    selectPorNomeCliente: async(nome) => {
        let filtroPorCliente = "WHERE cliente.nome LIKE '%" + nome + "%'"+ 
        "group by evento.id_evento "+
        "order by evento.data desc " +
        "limit 20";
        let query = queryDeBuscaEvento() + filtroPorCliente;
        return await db.consultarDb(query);
    },

    selectPorDataEspecifica: async(data) => {
        let filtroPorDataEspecifica = "WHERE evento.data LIKE '" + data +"%' " +
        "group by evento.id_evento "+
        "order by evento.data desc " ;
        let query = queryDeBuscaEvento() + filtroPorDataEspecifica;
        return await db.consultarDb(query);
    },

    selectPorIntervaloDeData: async(data) => {
        let filtroPorDataEspecifica = "WHERE evento.data BETWEEN '" +
        data.dataDe + "%' AND '" + data.dataAte + " 23:59:59' "+
        "group by evento.id_evento "+
        "order by evento.data desc ";
        let query = queryDeBuscaEvento() + filtroPorDataEspecifica;
        return await db.consultarDb(query);
    },

    selectUltimoEventoPorCliente: async(idCliente) => {
        let filtroPorCliente = "WHERE cliente.id_cliente LIKE ? " +  
        "group by evento.id_evento "+
        "order by evento.data desc " +
        "limit 1";
        let query = queryDeBuscaEvento() + filtroPorCliente;
        return await db.consultarDb(query, idCliente);
    },

    inserirNovoEvento: async(evento) => {
        let query = queryInsercaoEvento(evento); //gerando query para o db
        let resp = await db.consultarDb(query); //realizando a inserção no db
        return resp;
    },

    inserirBrinquedosNoEvento: async(id_evento, brinquedos) => {
        let query = queryInserirBrinquedosNoEvento(id_evento, brinquedos);
        let resp =  await db.consultarDb(query);
        return resp;
    },

    selectBrinquedosNaData: async(id_brinquedo, data_evento) => {
        let query =  "SELECT coalesce(( "+
            "select COUNT(*) as quantidade_alugada from " +
                "(select evento_brinquedo.brinquedo as brinquedo_alugado, evento_brinquedo.evento as evento " +                               
                    "from brinquedo " +
                    "join evento_brinquedo on brinquedo.id_brinquedo = evento_brinquedo.brinquedo " +
                    "join evento on evento_brinquedo.evento = evento.id_evento " +
                    "where evento_brinquedo.brinquedo = ? and evento.data like ? "+
                " ) as filtro_brinquedos "  +
            "group by brinquedo_alugado) "+
        ", 0) AS quantidade_alugada";
        let resp = await db.consultarDb(query, id_brinquedo, data_evento);
        if(resp.status){
            return resp.resultado[0].quantidade_alugada;
        }else{
            return null;
        }        
    },

    verificarSeBrinquedoEstaVago: async(id_brinquedo, id_evento) => {
        let data_evento = await queryDataEvento(id_evento);
        if(data_evento.resultado.length > 0){
            let qtdBrinquedos = null, qtdBrinquedosNaData = null;
            if(data_evento.status){
                data_evento = data_evento.resultado[0].data;
                qtdBrinquedos = await Brinquedo.selectQtdBrinquedos(id_brinquedo);
                qtdBrinquedosNaData = await Evento.selectBrinquedosNaData(id_brinquedo, data_evento);
                if((qtdBrinquedos - qtdBrinquedosNaData) > 0){
                    return true;
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }else{
            return false;
        }
       
    },
    editarEvento: async(id_evento, evento) => {
        let query = "UPDATE evento SET ? WHERE evento.id_evento = " + id_evento;
        /* return new Promise(function (resolve) {
            db.connection.query(query, evento, function (err, results, fields) {
                if (err) {
                    return resolve({status: false,
                                    resultado: err});
                }
                return resolve({status: true,
                                resultado: results});
            });
        }); */
        return await db.consultarDb(query, evento);
    },
    
    deletarBrinquedosNoEvento: async(id_evento) => {
        let query = 'DELETE FROM evento_brinquedo WHERE evento_brinquedo.evento = ?';
        return await db.consultarDb(query, id_evento);
    }
    
}


module.exports = Evento;