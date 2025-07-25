import React from 'react';
import { Product } from '../types';
import { ShoppingCart } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const API_BASE_URL = 'http://localhost:3001';

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <div
          key={product.id}
          className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
            !product.is_available ? 'opacity-60' : 'hover:shadow-md transition-shadow duration-200'
          }`}
        >
          <div className="relative">
            <img
              src={`${API_BASE_URL}${product.image_url}`}
              alt={product.name}
              className={`w-full h-48 object-cover ${!product.is_available ? 'grayscale' : ''}`}
            />
            {product.is_available ? (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                Disponível
              </div>
            ) : (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                Indisponível
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-green-600">
                R$ {parseFloat(product.price as any).toFixed(2)}
              </span>
              <button
                onClick={() => onProductSelect(product)}
                disabled={!product.is_available}
                className={`p-2 rounded-full ${
                  product.is_available
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
};