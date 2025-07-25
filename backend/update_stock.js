const mysql = require('mysql2/promise');

async function updateHistoricStock() {
  let connection;
  try {
    console.log('Conectando ao banco de dados...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'delivery',
    });
    console.log('Conexão bem-sucedida.');

    await connection.beginTransaction();
    console.log('Iniciando a verificação de pedidos concluídos para atualização de estoque...');

    // Obter todos os itens de pedidos com status 'completed'
    const [items] = await connection.query(`
      SELECT oi.product_id, oi.quantity, p.name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'completed'
    `);

    if (items.length === 0) {
      console.log('Nenhum item de pedidos concluídos encontrado para atualizar.');
      await connection.commit();
      return;
    }

    console.log(`Encontrados ${items.length} registros de itens em pedidos concluídos.`);

    // Agrupar as quantidades por produto para evitar múltiplas atualizações no mesmo produto
    const productUpdates = items.reduce((acc, item) => {
      acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
      return acc;
    }, {});

    for (const productId in productUpdates) {
      const totalQuantity = productUpdates[productId];
      console.log(`- Atualizando estoque para o produto ID ${productId}: deduzindo ${totalQuantity} unidade(s).`);
      
      const [result] = await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [totalQuantity, productId]
      );

      if (result.affectedRows === 0) {
        console.warn(`  - Aviso: O produto com ID ${productId} não foi encontrado na tabela de produtos. Nenhuma atualização de estoque foi feita para este item.`);
      }
    }

    await connection.commit();
    console.log('\nEstoque histórico atualizado com sucesso!');
    console.log('Este script não precisa ser executado novamente, a menos que haja novas vendas manuais no banco de dados.');

  } catch (error) {
    console.error('Ocorreu um erro durante a atualização do estoque. As alterações foram revertidas.', error);
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexão com o banco de dados fechada.');
    }
  }
}

updateHistoricStock();