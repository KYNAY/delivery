import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useData } from '../contexts/DataContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onCartClick?: () => void;
}

const API_BASE_URL = 'http://localhost:3001';

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBackButton, onBack, onCartClick }) => {
  const { getTotalItems } = useCart();
  const { storeSettings } = useData();
  const cartItems = getTotalItems();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              {storeSettings?.logo_url && (
                 <img
                  src={`${API_BASE_URL}${storeSettings.logo_url}`}
                  alt={storeSettings.store_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
              </div>
            </div>
          </div>
          
          <button
            onClick={onCartClick}
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <ShoppingCart className="w-6 h-6 text-gray-600" />
            {cartItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                {cartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};