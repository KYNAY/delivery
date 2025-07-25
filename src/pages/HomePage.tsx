import React, { useState, useEffect } from 'react';
import { Category, Brand, Product } from '../types';
import { useData } from '../contexts/DataContext';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryGrid } from '../components/CategoryGrid';
import { BrandGrid } from '../components/BrandGrid';
import { ProductModal } from '../components/ProductModal';
import { CheckoutForm } from '../components/CheckoutForm';
import { useNavigate, useParams } from 'react-router-dom';

type ViewType = 'categories' | 'brands';

interface HomePageProps {
  onCartClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCartClick }) => {
  const { categories, brands, loading, storeSettings } = useData();
  const navigate = useNavigate();
  const { categoryName: urlCategoryName } = useParams<{ categoryName: string }>();

  const [currentView, setCurrentView] = useState<ViewType>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (urlCategoryName) {
      const category = categories.find(cat => cat.name.toLowerCase() === urlCategoryName.toLowerCase());
      if (category) {
        setSelectedCategory(category);
        setCurrentView('brands');
      } else {
        navigate('/');
      }
    } else {
      setCurrentView('categories');
      setSelectedCategory(null);
    }
  }, [urlCategoryName, categories, navigate]);

  const handleCategorySelect = (category: Category) => {
    navigate(`/categoria/${encodeURIComponent(category.name.toLowerCase())}`);
  };

  const handleBack = () => {
    if (currentView === 'brands') {
      navigate('/');
    }
  };

  const handleContinueShopping = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleFinishOrder = () => {
    setIsProductModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false);
    setCurrentView('categories');
    setSelectedCategory(null);
  };

  const getHeaderTitle = () => {
    if (currentView === 'brands' && selectedCategory) {
      return selectedCategory.name;
    }
    return storeSettings.store_name || 'República Distribuidora';
  };

  const getHeaderSubtitle = () => {
    if (currentView === 'brands' && selectedCategory) {
      return storeSettings.store_name;
    }
    return undefined; // Sem subtítulo na visão principal
  };

  const getFilteredData = () => {
    if (currentView === 'categories') {
      return searchQuery
        ? categories.filter(cat => 
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : categories;
    }
    
    if (currentView === 'brands') {
      const categoryBrands = brands.filter(brand => 
        brand.category_id === selectedCategory?.id
      );
      return searchQuery
        ? categoryBrands.filter(brand =>
            brand.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : categoryBrands;
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={getHeaderTitle()}
        subtitle={getHeaderSubtitle()}
        showBackButton={currentView === 'brands'}
        onBack={handleBack}
        onCartClick={onCartClick}
      />
      
      <div className="max-w-7xl mx-auto py-6">
        <div className="mb-6 px-4">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder={`Buscar ${currentView === 'categories' ? 'categorias' : 'marcas'}...`}
          />
        </div>
        
        {currentView === 'categories' && (
          <CategoryGrid
            categories={getFilteredData() as Category[]}
          />
        )}
        
        {currentView === 'brands' && selectedCategory && (
          <BrandGrid
            brands={getFilteredData() as Brand[]}
            categoryName={selectedCategory.name}
          />
        )}
      </div>
      
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onContinueShopping={handleContinueShopping}
        onFinishOrder={handleFinishOrder}
      />
      
      <CheckoutForm
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
};