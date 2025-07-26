
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishOrder: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, onFinishOrder }) => {
  const { cart, removeFromCart, getTotalPrice } = useCart();

  if (!isOpen) return null;

  const handleFinishOrderClick = () => {
    onClose();
    onFinishOrder();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Seu Carrinho
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {cart.length === 0 ? (
              <p className="text-gray-600">Seu carrinho está vazio.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md mr-4"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                        <p className="text-sm font-semibold text-green-600">
                          R$ {(parseFloat(item.product.price as any) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                
                <div className="text-right pt-4 border-t mt-4">
                  <span className="text-xl font-bold text-gray-900">
                    Total: R$ {getTotalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {cart.length > 0 && (
              <button
                onClick={handleFinishOrderClick}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Finalizar Compra
              </button>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};