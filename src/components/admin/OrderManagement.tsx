
import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Order } from '../../types';
import { Package, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, loading } = useData();

  if (loading) {
    return <div>Carregando pedidos...</div>;
  }

  const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
    if (window.confirm(`Tem certeza que deseja mudar o status do pedido ${orderId} para ${newStatus}?`)) {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const handleDelete = (orderId: number) => {
    if (window.confirm(`ATENÇÃO: Esta ação é irreversível. Tem certeza que deseja DELETAR PERMANENTEMENTE o pedido ${orderId}?`)) {
      deleteOrder(orderId);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gerenciar Pedidos</h1>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID do Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {parseFloat(order.total_amount as any).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'processing')}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Marcar como Processando"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'completed')}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Marcar como Concluído"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                        title="Cancelar Pedido"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                     <button
                        onClick={() => handleDelete(order.id)}
                        className="text-gray-500 hover:text-red-900 ml-2"
                        title="Deletar Pedido Permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};