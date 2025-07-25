import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useData } from '../contexts/DataContext';
import { X } from 'lucide-react';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { storeSettings, addOrder } = useData();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState(''); // 'Dinheiro', 'Pix', 'Cartao'
  const [paymentType, setPaymentType] = useState('');     // 'Credito', 'Debito'
  const [paymentStatus, setPaymentStatus] = useState('Pagar na entrega'); // 'Pagar agora', 'Pagar na entrega'
  const [changeNeeded, setChangeNeeded] = useState<number | '' >('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderItemsForDb = cart.map(item => ({
      product_id: item.product.id, 
      quantity: item.quantity,
      price_at_purchase: item.product.price 
    }));

    const orderDataForDb = {
      customer_name: formData.name,
      customer_address: formData.address,
      customer_phone: formData.phone,
      total_amount: getTotalPrice(),
      payment_method: paymentMethod,
      payment_type: paymentType === '' ? null : paymentType, // Salva null se não for cartão
      payment_needed: paymentMethod === 'Dinheiro' && changeNeeded !== '' ? changeNeeded : null,
      items: orderItemsForDb,
    };

    try {
      const orderId = await addOrder(orderDataForDb);
      console.log('Pedido salvo no banco de dados com ID:', orderId);

      // Prepara os dados do pedido para a mensagem do WhatsApp
      let message = `🛒 *NOVO PEDIDO - ${storeSettings.store_name}*\n\n`;
      message += `👤 *Cliente:* ${formData.name}\n`;
      message += `📱 *Telefone:* ${formData.phone}\n`;
      message += `📍 *Endereço:* ${formData.address}\n\n`;
      
      message += `🛍️ *ITENS DO PEDIDO:*\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.product.name}\n`;
        message += `   Qtd: ${item.quantity} | Valor: R$ ${item.product.price.toFixed(2)}\n`;
        message += `   Subtotal: R$ ${(item.product.price * item.quantity).toFixed(2)}\n\n`;
      });
      
      message += `💰 *TOTAL: R$ ${getTotalPrice().toFixed(2)}*\n\n`;
      message += `💳 *FORMA DE PAGAMENTO:* ${paymentMethod}\n`;
      if (paymentMethod === 'Cartao') {
        message += `   Tipo: ${paymentType}\n`;
      }
      if (paymentMethod === 'Dinheiro' && changeNeeded !== '') {
        message += `   Troco para: R$ ${parseFloat(changeNeeded as any).toFixed(2)}\n`;
      }
      if (paymentMethod === 'Pix') {
        message += `   Chave Pix: ${storeSettings.pix_key}\n`;
      }
      message += `Status do Pagamento: ${paymentStatus}\n\n`;
      message += `📅 *Data:* ${new Date().toLocaleString('pt-BR')}`;
      
      const whatsappUrl = `https://wa.me/${storeSettings.whatsapp_number}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      clearCart();
      onSuccess();
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Ocorreu um erro ao finalizar seu pedido. Por favor, tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Finalizar Pedido
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone/WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço Completo *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, número, bairro, cidade..."
                  />
                </div>

                {/* Opções de Pagamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento *
                  </label>
                  <select
                    required
                    value={paymentMethod}
                    onChange={(e) => { setPaymentMethod(e.target.value); setPaymentType(''); setChangeNeeded(''); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartao">Cartão</option>
                  </select>
                </div>

                {paymentMethod === 'Dinheiro' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Troco para (opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={changeNeeded}
                      onChange={(e) => setChangeNeeded(parseFloat(e.target.value) || '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 50.00"
                    />
                    {changeNeeded !== '' && changeNeeded < getTotalPrice() && (
                      <p className="mt-1 text-sm text-red-600">O valor do troco deve ser maior ou igual ao total do pedido.</p>
                    )}
                  </div>
                )}

                {paymentMethod === 'Pix' && (
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Chave Pix:</p>
                    <p className="text-base font-semibold text-gray-900 break-all">{storeSettings.pix_key || 'Chave Pix não configurada'}</p>
                  </div>
                )}

                {paymentMethod === 'Cartao' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Cartão *
                    </label>
                    <select
                      required
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="Credito">Crédito</option>
                      <option value="Debito">Débito</option>
                    </select>
                  </div>
                )}

                {/* Pagar agora / Pagar na entrega */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="payNow"
                    checked={paymentStatus === 'Pagar agora'}
                    onChange={(e) => setPaymentStatus(e.target.checked ? 'Pagar agora' : 'Pagar na entrega')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="payNow" className="ml-2 block text-sm text-gray-900">
                    Pagar agora
                  </label>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-semibold mb-2">Resumo do Pedido:</h4>
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-semibold">
                    Total: R$ {getTotalPrice().toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Enviar Pedido via WhatsApp
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};