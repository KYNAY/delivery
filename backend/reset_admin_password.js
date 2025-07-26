// Importa as bibliotecas necessárias
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- CONFIGURAÇÃO ---
// Defina a nova senha para o administrador aqui
const NOVA_SENHA = 'admin'; // Mude para uma senha forte se desejar
const USUARIO_ADMIN = 'admin';
// --------------------

// Configuração do banco de dados online (copiado do server.js)
const onlineDbConfig = {
  host: 'srv1661.hstgr.io',
  user: 'u803902651_user',
  password: 'Delivery@2025',
  database: 'u803902651_name',
  // Adiciona um timeout para evitar que o script fique preso
  connectTimeout: 10000 
};

async function resetPassword() {
  console.log(`Iniciando a redefinição da senha para o usuário: ${USUARIO_ADMIN}`);
  
  let connection;
  try {
    // 1. Gerar o hash da nova senha
    console.log('Gerando hash da nova senha...');
    const hashedPassword = await bcrypt.hash(NOVA_SENHA, 10);
    console.log('Hash gerado com sucesso.');

    // 2. Conectar ao banco de dados
    console.log('Conectando ao banco de dados da Hostinger...');
    connection = await mysql.createConnection(onlineDbConfig);
    console.log('Conexão com o banco de dados estabelecida.');

    // 3. Atualizar a senha no banco de dados
    const query = 'UPDATE users SET password = ? WHERE username = ?';
    console.log(`Executando a query para atualizar o usuário '${USUARIO_ADMIN}'...`);
    
    const [result] = await connection.execute(query, [hashedPassword, USUARIO_ADMIN]);

    // 4. Verificar o resultado
    if (result.affectedRows > 0) {
      console.log('\n----------------------------------------------------');
      console.log('✅ SUCESSO! A senha foi redefinida com sucesso.');
      console.log(`O usuário '${USUARIO_ADMIN}' agora pode logar com a senha: '${NOVA_SENHA}'`);
      console.log('----------------------------------------------------');
    } else {
      console.error('\n----------------------------------------------------');
      console.error(`❌ ERRO: O usuário '${USUARIO_ADMIN}' não foi encontrado no banco de dados.`);
      console.error('Nenhuma alteração foi feita.');
      console.error('----------------------------------------------------');
    }

  } catch (error) {
    console.error('\n----------------------------------------------------');
    console.error('❌ ERRO GERAL DURANTE O PROCESSO:', error.message);
    console.error('Verifique se o seu IP atual está liberado no MySQL Remoto da Hostinger.');
    console.error('----------------------------------------------------');
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexão com o banco de dados fechada.');
    }
  }
}

resetPassword();