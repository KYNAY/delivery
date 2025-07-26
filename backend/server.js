const path = require('path');
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3001;

// Configuração explícita do CORS
const corsOptions = {
  origin: 'https://distribuidora-republica.netlify.app',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURAÇÃO DO BANCO DE DADOS ---
const USE_ONLINE_DB = process.env.USE_ONLINE_DB === 'true';

const localDbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'delivery',
};

const onlineDbConfig = {
  host: 'srv1661.hstgr.io', // Host Remoto da Hostinger
  user: 'u803902651_user',
  password: 'Delivery@2025',
  database: 'u803902651_name',
};

const dbConfig = USE_ONLINE_DB ? onlineDbConfig : localDbConfig;

console.log(`Conectando ao banco de dados: ${USE_ONLINE_DB ? 'ONLINE' : 'LOCAL'}`);

const db = mysql.createConnection(dbConfig).promise();

// --- CONFIGURAÇÃO DE UPLOAD (CLOUDINARY) ---
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configura o Cloudinary com as variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configura o armazenamento do Multer para o Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // req.body.type vem do frontend (category, brand, product, logo)
    const folder = `delivery_app/${req.body.type || 'outros'}`;
    return {
      folder: folder,
      allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
      // Garante um nome de arquivo único
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

// Rota de upload de imagem
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }
  // A URL da imagem já vem pronta do Cloudinary em req.file.path
  res.json({ imageUrl: req.file.path });
});

// Basic route
app.get('/', (req, res) => {
  res.send('API do Delivery App está funcionando!');
});

// Rotas para Autenticação
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: 'Usuário ou senha inválidos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Usuário ou senha inválidos.' });
    }

    res.json({ message: 'Login bem-sucedido!', user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro no servidor.');
  }
});

// Rotas para Gerenciamento de Usuários
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, role FROM users');
    res.json(users);
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    res.status(500).send(err);
  }
});

app.post('/api/users', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash da senha
    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [username, hashedPassword, role]);
    res.status(201).json({ id: result.insertId, username, role });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).send('Erro ao criar usuário.');
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  try {
    let query = 'UPDATE users SET username = ?, role = ? WHERE id = ?';
    let params = [username, role, id];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?';
      params = [username, hashedPassword, role, id];
    }

    await db.query(query, params);
    res.json({ id, username, role });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).send('Erro ao atualizar usuário.');
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).send('Erro ao deletar usuário.');
  }
});

// Rotas para Categorias
app.get('/api/categories', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM categories ORDER BY `order` ASC');
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar categorias:', err);
    res.status(500).send(err);
  }
});

app.post('/api/categories', async (req, res) => {
  const { name, icon, order, image_url } = req.body;
  const query = 'INSERT INTO categories (name, icon, `order`, image_url) VALUES (?, ?, ?, ?)';
  try {
    const [result] = await db.query(query, [name, icon, order, image_url]);
    res.status(201).json({ id: result.insertId, name, icon, order, image_url });
  } catch (err) {
    console.error('Erro ao adicionar categoria:', err);
    res.status(500).send(err);
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, icon, order, image_url } = req.body;
  const query = 'UPDATE categories SET name = ?, icon = ?, `order` = ?, image_url = ? WHERE id = ?';
  try {
    await db.query(query, [name, icon, order, image_url, id]);
    res.json({ id, name, icon, order, image_url });
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    res.status(500).send(err);
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM categories WHERE id = ?';
  try {
    await db.query(query, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar categoria:', err);
    res.status(500).send(err);
  }
});

// Rotas para Marcas
app.get('/api/brands', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM brands');
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar marcas:', err);
    res.status(500).send(err);
  }
});

app.post('/api/brands', async (req, res) => {
  const { name, category_id, image_url } = req.body;
  const query = 'INSERT INTO brands (name, category_id, image_url) VALUES (?, ?, ?)';
  try {
    const [result] = await db.query(query, [name, category_id, image_url]);
    res.status(201).json({ id: result.insertId, name, category_id, image_url });
  } catch (err) {
    console.error('Erro ao adicionar marca:', err);
    res.status(500).send(err);
  }
});

app.put('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category_id, image_url } = req.body;
  const query = 'UPDATE brands SET name = ?, category_id = ?, image_url = ? WHERE id = ?';
  try {
    await db.query(query, [name, category_id, image_url, id]);
    res.json({ id, name, category_id, image_url });
  } catch (err) {
    console.error('Erro ao atualizar marca:', err);
    res.status(500).send(err);
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM brands WHERE id = ?';
  try {
    await db.query(query, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar marca:', err);
    res.status(500).send(err);
  }
});

// Rotas para Produtos
app.get('/api/products', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM products');
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    res.status(500).send(err);
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, price, image_url, category_id, brand_id, stock_quantity, is_available } = req.body;
  const query = 'INSERT INTO products (name, description, price, image_url, category_id, brand_id, stock_quantity, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  try {
    const [result] = await db.query(query, [name, description, price, image_url, category_id, brand_id, stock_quantity, is_available]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    console.error('Erro ao adicionar produto:', err);
    res.status(500).send(err);
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category_id, brand_id, stock_quantity, is_available } = req.body;
  const query = 'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, brand_id = ?, stock_quantity = ?, is_available = ? WHERE id = ?';
  try {
    await db.query(query, [name, description, price, image_url, category_id, brand_id, stock_quantity, is_available, id]);
    res.json({ id, ...req.body });
  } catch (err) {
    console.error('Erro ao atualizar produto:', err);
    res.status(500).send(err);
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  try {
    await db.query(query, [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Erro ao deletar produto:', err);
    res.status(500).send(err);
  }
});

// Rota para ajustar o estoque de um produto
app.patch('/api/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body; // quantidade a ser adicionada (pode ser negativa)

  if (typeof quantity !== 'number') {
    return res.status(400).json({ message: 'A quantidade deve ser um número.' });
  }

  try {
    const query = 'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?';
    const [result] = await db.query(query, [quantity, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // Retorna o estoque atualizado
    const [product] = await db.query('SELECT stock_quantity FROM products WHERE id = ?', [id]);
    res.json({ new_stock_quantity: product[0].stock_quantity });

  } catch (err) {
    console.error('Erro ao ajustar o estoque:', err);
    res.status(500).send('Erro no servidor ao ajustar o estoque.');
  }
});

// Rotas para Configurações da Loja
app.get('/api/settings', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM store_settings WHERE id = 1');
    res.json(results[0]);
  } catch (err) {
    console.error('Erro ao buscar configurações:', err);
    res.status(500).send(err);
  }
});

app.put('/api/settings', async (req, res) => {
  const { store_name, logo_url, whatsapp_number, address, pix_key } = req.body;
  const query = 'UPDATE store_settings SET store_name = ?, logo_url = ?, whatsapp_number = ?, address = ?, pix_key = ? WHERE id = 1';
  try {
    await db.query(query, [store_name, logo_url, whatsapp_number, address, pix_key]);
    res.json(req.body);
  } catch (err) {
    console.error('Erro ao atualizar configurações:', err);
    res.status(500).send(err);
  }
});

// Rotas para Pedidos
app.get('/api/orders', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err);
    res.status(500).send(err);
  }
});

app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [orderResults] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (orderResults.length === 0) return res.status(404).send('Pedido não encontrado');

    const [itemsResults] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    res.json({ ...orderResults[0], items: itemsResults });
  } catch (err) {
    console.error('Erro ao buscar pedido:', err);
    res.status(500).send(err);
  }
});

app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_address, customer_phone, total_amount, payment_method, payment_type, payment_status, change_needed, items } = req.body;

  try {
    // Inserir o pedido principal
    const orderQuery = 'INSERT INTO orders (customer_name, customer_address, customer_phone, total_amount, payment_method, payment_type, payment_status, change_needed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const [orderResult] = await db.query(orderQuery, [customer_name, customer_address, customer_phone, total_amount, payment_method, payment_type, payment_status, change_needed]);
    const orderId = orderResult.insertId;

    // Inserir os itens do pedido
    for (const item of items) {
      const itemQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)';
      await db.query(itemQuery, [orderId, item.product_id, item.quantity, item.price_at_purchase]);
    }

    res.status(201).json({ id: orderId, message: 'Pedido criado com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).send('Erro ao criar pedido');
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Atualiza o status do pedido
    const updateStatusQuery = 'UPDATE orders SET status = ? WHERE id = ?';
    await connection.query(updateStatusQuery, [status, id]);

    // 2. Se o status for 'Concluído', atualiza o estoque
    if (status === 'completed') {
      // Pega os itens do pedido
      const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

      // Itera sobre cada item e atualiza o estoque do produto correspondente
      for (const item of items) {
        const updateStockQuery = 'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?';
        const [result] = await connection.query(updateStockQuery, [item.quantity, item.product_id, item.quantity]);

        // Se nenhuma linha foi afetada, significa que não havia estoque suficiente.
        if (result.affectedRows === 0) {
          throw new Error(`Estoque insuficiente para o produto ID: ${item.product_id}. A transação será revertida.`);
        }
      }
    }

    // Se tudo deu certo, confirma a transação
    await connection.commit();
    res.json({ message: 'Status do pedido atualizado e estoque ajustado com sucesso!' });

  } catch (err) {
    // Se algo deu errado, reverte todas as alterações
    await connection.rollback();
    console.error('Erro ao atualizar status do pedido ou estoque:', err);
    res.status(500).send(err.message || 'Erro ao processar a solicitação.');
  } finally {
    // Libera a conexão com o banco de dados
    connection.release();
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Deleta primeiro os itens do pedido para evitar problemas de chave estrangeira
    await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);
    // Depois deleta o pedido principal
    const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      throw new Error('Pedido não encontrado.');
    }

    await connection.commit();
    res.status(204).send(); // 204 No Content é a resposta padrão para um delete bem-sucedido
  } catch (err) {
    await connection.rollback();
    console.error('Erro ao deletar pedido:', err);
    res.status(500).send('Erro ao deletar pedido.');
  } finally {
    connection.release();
  }
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});