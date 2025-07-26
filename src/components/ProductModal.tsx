import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { X, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping: () => void;
  onFinishOrder: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onContinueShopping,
  onFinishOrder
}) => {
  const { addToCart, updateQuantity: updateCartQuantity, cart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Atualiza a quantidade inicial se o produto mudar ou o modal for reaberto
  useEffect(() => {
    if (isOpen && product) {
      const existingItem = cart.find(item => item.product.id === product.id);
      setQuantity(existingItem ? existingItem.quantity : 1);
    }
  }, [isOpen, product, cart]);

  if (!isOpen || !product) return null;

  const handleUpdateCart = () => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      updateCartQuantity(product.id, quantity);
    } else {
      addToCart(product, quantity);
    }
  };

  const handleContinueShoppingClick = () => {
    handleUpdateCart();
    onContinueShopping();
  };

  const handleFinishOrderClick = () => {
    handleUpdateCart();
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
                {product.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="flex items-center justify-between mb-6">
              <span className="text-2xl font-bold text-green-600">
                R$ {parseFloat(product.price as any).toFixed(2)}
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="text-right mb-4">
              <span className="text-lg font-semibold">
                Total: R$ {(parseFloat(product.price as any) * quantity).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
            <button
              onClick={handleFinishOrderClick}
              className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Finalizar Compra
            </button>
            <button
              onClick={handleContinueShoppingClick}
              className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};