const multer = require('multer');
const fs = require('fs');
const definicoes = require('../model/definicoes');

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
      cb(null, definicoes.localAssets)
    },
    filename: function (req, file, cb) { 
      if(file){
        let fileName = file.originalname;
        cb(null, fileName);
      }
    },
      onError: (err, next) => {
        console.log(err);
        
      }
  });


  const limits = {
    fileSize: 200 * 1024  // Limite de tamanho do arquivo em bytes (200KB)
  };
  const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png']; // Tipos de arquivo permitidos
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true); // Aceitar arquivo
    } else {
      cb(new Error('Tipo de arquivo não suportado. Apenas arquivos JPEG ou PNG são permitidos.'), false); // Rejeitar arquivo
    }
  }

const upload = multer({
  storage: storage, 
  limits: limits,
  fileFilter: fileFilter,
});

/*
// Lidar com erros de arquivos com mesmo nome
upload.on('fileRename', (oldFileName, newFileName) => {
  console.log(`Arquivo com mesmo nome (${oldFileName}) foi renomeado para ${newFileName}.`);
});

// Lidar com erros de gravação em disco
upload.on('error', (error, req, res) => {
  console.error('Erro de gravação em disco:', error.message);
  res.status(500).send('Erro interno do servidor ao salvar o arquivo.');
});
*/
// Criar a pasta de local assets se ela não existir
if (!fs.existsSync(definicoes.localAssets)) {
  try{
    fs.mkdirSync(definicoes.localAssets);
    console.log(`Pasta ${definicoes.localAssets} criada com sucesso!`);
  }catch(err){
    console.log(`Ocorreu o seguinte erro ao tentar criar a pasta ${definicoes.localAssets}:`);
    console.log(err);
  }
}


module.exports = upload;
