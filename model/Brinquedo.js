const Db = require('../controller/Db');

const fs = require('node:fs/promises');

const Brinquedo = {
    selectTodosBrinquedos: async(coluna) => {
        if (!coluna){
            coluna = '*';
        }
        let query = 'SELECT * FROM brinquedo';  
        return await db.consultarDb(query);
    },
    selectIdBrinquedosNaData: async(data) => {
        /*
        let query = "SELECT brinquedo.id_brinquedo FROM brinquedo JOIN evento_brinquedo ON " +
        "brinquedo.id_brinquedo = evento_brinquedo.brinquedo " +
        "JOIN evento ON " +
        "evento_brinquedo.evento = evento.id_evento " +*/
        let sql = "select count(*) as quantidade_alugada, id_brinquedo from " +
                "(select evento_brinquedo.brinquedo as id_brinquedo, "+
                    "evento_brinquedo.evento as evento "+
                    "from brinquedo "+
                    "join evento_brinquedo "+
                    "on brinquedo.id_brinquedo = evento_brinquedo.brinquedo "+
                    "join evento "+
                    "on evento_brinquedo.evento = evento.id_evento "+
                    "where evento.data like ? "+
                    ") as filtro_brinquedos "+ 
                "group by id_brinquedo";
        return await db.consultarDb(sql, data);        
    },
    informarBrinquedosVagosNaData: async (data) => {
        let listaBrinquedosAlugados = await Brinquedo.selectIdBrinquedosNaData(data);
        let listaDeTodosOsBrinquedos = await Brinquedo.selectTodosBrinquedos();
        let listaDeBrinquedosDisponiveis = [];
        if (listaDeTodosOsBrinquedos.status && listaBrinquedosAlugados.status){
            listaDeTodosOsBrinquedos.resultado.forEach(brinquedo => {
                listaBrinquedosAlugados.resultado.forEach(brinquedoAlugado => {
                    if(brinquedo.id_brinquedo === brinquedoAlugado.id_brinquedo){
                        brinquedo.quantidade -= brinquedoAlugado.quantidade_alugada;                 
                    }
                });
                if(brinquedo.quantidade > 0)
                    listaDeBrinquedosDisponiveis.push(brinquedo);
            });
        }else{
            return {status: false,
                    resultado: 'Erro no banco de dados na hora de listar brinquedos'};
        }
        return {status: true,
                data: data,
                resultado: listaDeBrinquedosDisponiveis
        };
    },
    selectQtdBrinquedos: async (id_brinquedo) => {
        let query = "SELECT quantidade FROM brinquedo WHERE id_brinquedo = ?";
        let quantidade = await db.consultarDb(query, id_brinquedo);
        if(quantidade.status){
            quantidade = quantidade.resultado[0].quantidade;
        }else{
            return false;
        }
        return quantidade;
    },
    editarBrinquedo: async (brinquedo) => {
        console.log(brinquedo);
        let query = 'UPDATE brinquedo SET ';
        query +=  brinquedo.estaDisponivel? 'esta_disponivel = ' + '0': 'esta_disponivel = ' + '1 '; 
        query +=  brinquedo.caracteristicas? ', caracteristicas = "' + brinquedo.caracteristicas + '" ':'';         
        query +=  brinquedo.nome_brinquedo? ', nome_brinquedo = "' + brinquedo.nome_brinquedo + '" ': ''
        query +=  brinquedo.observacao? ', observacao = "' + brinquedo.observacao + '" ': '' 
        query +=  brinquedo.quantidade? ', quantidade = ' + brinquedo.quantidade + ' ': '' 
        query +=  brinquedo.valor_brinquedo? ', valor_brinquedo = "' + brinquedo.valor_brinquedo + '" ': '' 
        query +=  brinquedo.foto_brinquedo? ', foto_brinquedo = "' + brinquedo.foto_brinquedo + '" ': '' 
        query +=  'where id_brinquedo = ' + brinquedo.id_brinquedo;
        return await db.consultarDb(query);
    },
    inserirBrinquedo: async (brinquedo) => {
        let query = 'INSERT INTO brinquedo (';
        query +=  brinquedo.nome_brinquedo? 'nome_brinquedo' : '';
        query +=  brinquedo.valor_brinquedo && !isNaN(brinquedo.valor_brinquedo)? ', valor_brinquedo' : '';
        query +=  brinquedo.quantidade && !isNaN(brinquedo.quantidade)? ', quantidade' : '';
        query +=  brinquedo.caracteristicas? ', caracteristicas' : '';
        query +=  brinquedo.foto_brinquedo? ', foto_brinquedo' : '';
        query +=  brinquedo.observacao? ', observacao' : '';
        query += ', esta_disponivel) VALUES ("';
        query +=  brinquedo.nome_brinquedo? brinquedo.nome_brinquedo + '", "' : '';
        query +=  brinquedo.valor_brinquedo && !isNaN(brinquedo.valor_brinquedo)? brinquedo.valor_brinquedo + '", "' : '';
        query +=  brinquedo.quantidade && !isNaN(brinquedo.quantidade)? brinquedo.quantidade + '", "' : '';
        query +=  brinquedo.caracteristicas?  brinquedo.caracteristicas + '", "' : '';
        query +=  brinquedo.foto_brinquedo?  brinquedo.foto_brinquedo + '", "' : '';
        query +=  brinquedo.observacao?  brinquedo.observacao + '", ' : '';
        query +=  '0 )';
        return await db.consultarDb(query);
    }
};

module.exports = Brinquedo;