import React, { useState, useEffect } from 'react';
import { Product, Brand, Category } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Modal para ajustar o estoque
const StockAdjustmentModal = ({ product, onClose, onStockUpdate }) => {
  const [adjustment, setAdjustment] = useState(1);
  const [action, setAction] = useState<'add' | 'remove'>('add');

  const handleUpdate = async () => {
    const quantity = action === 'add' ? adjustment : -adjustment;
    try {
      const response = await fetch(`${API_URL}/products/${product.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar o estoque');
      const data = await response.json();
      onStockUpdate(product.id, data.new_stock_quantity);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Não foi possível atualizar o estoque.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-4">Ajustar Estoque: {product.name}</h3>
        <div className="mb-4">
          <p>Estoque Atual: <span className="font-semibold">{product.stock_quantity}</span></p>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <select 
            value={action} 
            onChange={(e) => setAction(e.target.value as 'add' | 'remove')}
            className="p-2 border rounded-md"
          >
            <option value="add">Adicionar</option>
            <option value="remove">Remover</option>
          </select>
          <input
            type="number"
            value={adjustment}
            onChange={(e) => setAdjustment(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="p-2 border rounded-md w-full"
            min="1"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
            Cancelar
          </button>
          <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};


const StockManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, brandsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/brands`),
          fetch(`${API_URL}/categories`),
        ]);
        if (!productsRes.ok || !brandsRes.ok || !categoriesRes.ok) {
          throw new Error('Falha ao carregar dados');
        }
        const productsData = await productsRes.json();
        const brandsData = await brandsRes.json();
        const categoriesData = await categoriesRes.json();
        
        setProducts(productsData.sort((a, b) => a.name.localeCompare(b.name)));
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStockUpdate = (productId: number, newStock: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === productId ? { ...p, stock_quantity: newStock } : p))
    );
  };

  const getBrandName = (brandId: number) => brands.find(b => b.id === brandId)?.name || 'N/A';
  const getCategoryName = (categoryId: number) => categories.find(c => c.id === categoryId)?.name || 'N/A';

  if (loading) return <div className="text-center p-4">Carregando estoque...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Erro: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciamento de Estoque</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getBrandName(product.brand_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCategoryName(product.category_id)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${product.stock_quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button 
                      onClick={() => setSelectedProduct(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
                    >
                      Ajustar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedProduct && (
        <StockAdjustmentModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onStockUpdate={handleStockUpdate}
        />
      )}
    </div>
  );
};

export default StockManagement;
