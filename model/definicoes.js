var definicoes = {
    definicoesGlobais: {
     
    },
    definicoesExpress: {
        porta: 9000
    },
    
    definicoesDb: {
        conexaoLocal: {
            host     : 'localhost',
            user     : 'playdiversao',
            password : 'playdiversao',
            database : 'playdiversao', //não colocar se for criar um banco através do node
            multipleStatements: true //cuidado: deve ser falso (padrão) para evitar sql injection - com ele true testar a rota: http://localhost:3000/post/1;DROP%20TABLE%20posts    
        }
    },
    imagemNaoEncontrada: 'imagem_nao_encontrada.png',
    localAssets: __dirname+'/../public/imagens/'
}



module.exports = definicoes;