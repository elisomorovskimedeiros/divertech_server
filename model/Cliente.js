const Db = require('../controller/Db');
//const db = new Db();

const querySelectCliente = 'SELECT * FROM cliente ';
const querySelectClienteComDataEvento = 'SELECT * FROM cliente JOIN evento on cliente.id_cliente = evento.id_cliente ';

const queryInsercaoCliente = (cliente) => {
    const query = "INSERT INTO cliente (nome, cpf, email, telefone, telefone_recado, data_nascimento, logradouro, numero, " +
    " complemento, observacao_endereco, bairro, cidade, observacao_cliente) VALUES "+
    "('"+ cliente.nome + "', '" + cliente.cpf + "', '" + cliente.email + "', '" + cliente.telefone + "', '" + 
    cliente.telefone_recado + "', '" + cliente.data_nascimento +"', '" + cliente.logradouro + "', '" +cliente.numero + "', '" + 
    cliente.complemento + "' , '" + cliente.observacao_endereco + "', '"+
    cliente.bairro + "', ' " + cliente.cidade + "', ' " + cliente.observacao_cliente + "')";

    return query;
}

const Cliente = {
    selectPorId: async(id) => {
        let query = querySelectCliente + ' WHERE cliente.id_cliente = ?';
        return await db.consultarDb(query, id);
    },

    selectPorNome: async(nome) => {
        let query = querySelectCliente + ' WHERE cliente.nome LIKE ?';
        console.log(query);

        return await db.consultarDb(query, nome);
    },

    selectClientesProximos15Dias: async() => {
        query = querySelectClienteComDataEvento + "WHERE evento.data BETWEEN CURDATE() AND CURDATE() + INTERVAL 15 DAY "+ 
            "group by evento.id_evento "+
            "order by evento.data asc";
        return await db.consultarDb(query);
    },

    selectPesquisaDetalhada: async(termosDePesquisa) => {
        //solicitação com filtro mais detalhado
        //[0]: cpf
        //[1]: nome
        //[2]: logradouro
        //[3]: cidade
        //[4]: data de algum evento do cliente
        let query = '';
        let termosDeBusca = `WHERE cliente.cpf LIKE "${termosDePesquisa[0]}%"` +
        `AND cliente.nome LIKE "%${termosDePesquisa[1]}%"` +
        `AND cliente.logradouro LIKE "%${termosDePesquisa[2]}%"` +
        `AND cliente.cidade LIKE "${termosDePesquisa[3]}%"`;
        if(termosDePesquisa[4] === ''){
            query = querySelectCliente + termosDeBusca;  
            return await db.consultarDb(query);
        }else {
            query = querySelectClienteComDataEvento + termosDeBusca +
            `AND evento.data LIKE "${termosDePesquisa[4]}%"`;
            return await db.consultarDb(query);
        }
    },

    inserirNovoCliente: async(cliente) => {
        let query = queryInsercaoCliente(cliente);
        return await db.consultarDb(query);
    },

    editarCliente: async(cliente) => {
        let query = `UPDATE cliente ` + 
            `SET nome = "${cliente.nome}", cpf = "${cliente.cpf}", telefone = "${cliente.telefone}", `+
            `telefone_recado = "${cliente.telefone_recado}", email = "${cliente.email}", ` + 
            `data_nascimento = "${cliente.data_nascimento}", logradouro = "${cliente.logradouro}",` +
            `numero = "${cliente.numero}", bairro = "${cliente.bairro}", cidade = "${cliente.cidade}", ` + 
            `complemento = "${cliente.complemento}", observacao_endereco = "${cliente.observacao_endereco}", ` +
            `observacao_cliente = "${cliente.observacao_cliente}" WHERE id_cliente = ?`;
        return await db.consultarDb(query, cliente.id_cliente);
    }
}

module.exports = Cliente;