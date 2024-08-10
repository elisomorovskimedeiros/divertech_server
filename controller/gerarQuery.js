var verificarSeObjeto = (objeto) => {
    return Object.prototype.toString.call(objeto) === '[object Object]';
}


var gerarQuery = async function (db, query, param1, param2){
    if(!verificarSeObjeto(param1)){
        if (!param1 || String(param1).length < 1)
            param1 = null;
        else if(isNaN(param1))
            param1 = '%'+param1+'%';
    }

    if(!verificarSeObjeto(param2)){
        if (!param2 || String(param2).length < 1)
            param2 = null;
        else if(isNaN(param2))
            param2 = '%'+param2+'%';
    }
    
    return new Promise(function (resolve) {
        db.connection.query(query, [param1?param1:0, param2?param2:0], function (err, results, fields) {
            if (err) {
                return resolve({status: false,
                                resultado: err});
            }
            return resolve({status: true,
                            resultado: results});
        });
    });
}

module.exports = gerarQuery;
