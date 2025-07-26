import React from 'react';
import { useData } from '../../contexts/DataContext';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  AlertTriangle,
  TrendingUp 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { products, orders } = useData();
  
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0);
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(order => order.status === 'completed') // Filtra apenas pedidos concluídos
    .reduce((sum, order) => {
      const amount = parseFloat(order.total_amount as any);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  const uniqueCustomers = new Set(orders.map(o => o.customer_email)).size;

  const topProducts = products
    .sort((a, b) => b.stock_quantity - a.stock_quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
              <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Faturamento</p>
              <p className="text-2xl font-semibold text-gray-900">
                R$ {totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes Únicos</p>
              <p className="text-2xl font-semibold text-gray-900">{uniqueCustomers}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alertas de estoque */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900 ml-2">Alertas de Estoque</h2>
          </div>
          
          {outOfStockProducts.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-red-600 mb-2">Produtos em Falta:</h3>
              <div className="space-y-1">
                {outOfStockProducts.map(product => (
                  <p key={product.id} className="text-sm text-gray-600">
                    • {product.name}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          {lowStockProducts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-orange-600 mb-2">Estoque Baixo (≤10):</h3>
              <div className="space-y-1">
                {lowStockProducts.map(product => (
                  <p key={product.id} className="text-sm text-gray-600">
                    • {product.name} - {product.stock_quantity} restantes
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Top produtos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-6 w-6 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900 ml-2">Produtos com Maior Estoque</h2>
        </div>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 w-6">
                  {index + 1}.
                </span>
                <span className="text-sm text-gray-900 ml-2">{product.name}</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {product.stock_quantity} unidades
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};