const mysql = require("mysql"),
definicoes = require('../model/definicoes'),
gerarQuery = require('./gerarQuery');

//definir conexão db para conexão
var defDb = definicoes.definicoesDb.conexaoLocal;

class Db{

    constructor(){
        
        try {
            this.connection = mysql.createConnection(defDb);
            console.log("################conectou#################");
        } catch (error) {
            console.log("###############deu erro#####################");
            console.log(error);
        }        
    }

    
    async consultarDb(query, param1, param2){
        return await gerarQuery(this, query, param1, param2);
    }   
}

module.exports = Db;
