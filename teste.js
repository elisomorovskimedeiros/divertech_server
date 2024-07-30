const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 4000;

// Configuração do Multer para o armazenamento de arquivos em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + '-' + file.originalname; // Nome do arquivo (timestamp + nome original)
    cb(null, fileName);
  }
});

// Configuração do Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de tamanho do arquivo em bytes (5MB)
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png']; // Tipos de arquivo permitidos
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true); // Aceitar arquivo
    } else {
      cb(new Error('Tipo de arquivo não suportado. Apenas arquivos JPEG ou PNG são permitidos.'), false); // Rejeitar arquivo
    }
  }
});

// Rota para receber o upload de arquivos
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('Nenhum arquivo foi enviado.');
    }
    
    // Processar o arquivo aqui, se necessário

    res.status(200).send('Arquivo recebido e salvo com sucesso.');
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(400).send(error.message); // Enviar mensagem de erro ao cliente
  }
});

// Lidar com erros de arquivos com mesmo nome
upload.on('fileRename', (oldFileName, newFileName) => {
  console.log(`Arquivo com mesmo nome (${oldFileName}) foi renomeado para ${newFileName}.`);
});

// Lidar com erros de gravação em disco
upload.on('error', (error, req, res) => {
  console.error('Erro de gravação em disco:', error.message);
  res.status(500).send('Erro interno do servidor ao salvar o arquivo.');
});

// Criar a pasta 'uploads' se ela não existir
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
