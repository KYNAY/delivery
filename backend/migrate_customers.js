const mysql = require('mysql2/promise');

// --- Configuração do Banco de Dados ---
// Altere se necessário para corresponder à sua configuração
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'delivery',
};

async function migrateCustomers() {
  let connection;
  try {
    console.log('Conectando ao banco de dados...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexão bem-sucedida.');

    console.log('\nIniciando a migração de clientes...');
    
    // 1. Buscar todos os pedidos que ainda não têm um customer_id
    console.log('Passo 1: Buscando pedidos com dados de cliente antigos...');
    const [orders] = await connection.execute(
      'SELECT id, customer_name, customer_phone, customer_address FROM `orders` WHERE customer_id IS NULL AND customer_phone IS NOT NULL'
    );

    if (orders.length === 0) {
      console.log('Nenhum cliente novo para migrar. Tudo já parece estar atualizado.');
      return;
    }
    console.log(`Encontrados ${orders.length} registros de pedidos para processar.`);

    let newCustomersCount = 0;
    let updatedOrdersCount = 0;

    // Usar um Map para evitar buscas repetidas no banco para o mesmo número de telefone
    const phoneToCustomerIdMap = new Map();

    // 2. Iterar sobre cada pedido
    for (const order of orders) {
      const { id: orderId, customer_name, customer_phone, customer_address } = order;

      // Pula se não houver número de telefone, que é nossa chave principal
      if (!customer_phone) {
        console.warn(`- Pedido ID ${orderId} pulado: sem número de telefone.`);
        continue;
      }

      let customerId;

      // Verifica se já processamos este telefone neste script
      if (phoneToCustomerIdMap.has(customer_phone)) {
        customerId = phoneToCustomerIdMap.get(customer_phone);
      } else {
        // 3. Verificar se o cliente já existe na tabela `customers`
        const [existingCustomers] = await connection.execute(
          'SELECT id FROM `customers` WHERE customer_phone = ?',
          [customer_phone]
        );

        if (existingCustomers.length > 0) {
          // Cliente já existe, pega o ID
          customerId = existingCustomers[0].id;
        } else {
          // 4. Se não existir, cria um novo cliente
          console.log(`  - Criando novo cliente: ${customer_name} (${customer_phone})`);
          const [result] = await connection.execute(
            'INSERT INTO `customers` (customer_name, customer_phone, customer_address) VALUES (?, ?, ?)',
            [customer_name, customer_phone, customer_address]
          );
          customerId = result.insertId;
          newCustomersCount++;
        }
        // Armazena no cache local para a próxima vez
        phoneToCustomerIdMap.set(customer_phone, customerId);
      }

      // 5. Atualizar o pedido com o customer_id correto
      if (customerId) {
        await connection.execute(
          'UPDATE `orders` SET customer_id = ? WHERE id = ?',
          [customerId, orderId]
        );
        updatedOrdersCount++;
        process.stdout.write(`\rProcessando... Pedidos atualizados: ${updatedOrdersCount}/${orders.length}`);
      }
    }

    console.log('\n\n--- Migração Concluída! ---');
    console.log(`Clientes novos criados: ${newCustomersCount}`);
    console.log(`Pedidos antigos atualizados: ${updatedOrdersCount}`);
    console.log('---------------------------\n');
    console.log('IMPORTANTE: Agora você pode considerar remover as colunas `customer_name`, `customer_phone`, e `customer_address` da tabela `orders` se todos os dados foram migrados com sucesso.');
    console.log('Execute o seguinte SQL manualmente se desejar:');
    console.log('ALTER TABLE `orders` DROP COLUMN `customer_name`, DROP COLUMN `customer_phone`, DROP COLUMN `customer_address`;');


  } catch (error) {
    console.error('\n\nERRO DURANTE A MIGRAÇÃO:', error);
    console.error('Nenhuma alteração foi permanentemente salva se o erro ocorreu no meio do processo.');
  } finally {
    if (connection) {
      console.log('\nFechando a conexão com o banco de dados.');
      await connection.end();
    }
  }
}

migrateCustomers();