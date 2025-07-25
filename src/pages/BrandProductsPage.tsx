
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Header } from '../components/Header';
import { ProductGrid } from '../components/ProductGrid';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../types';
import { CheckoutForm } from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext'; // Importar useCart

interface BrandProductsPageProps {
  onCartClick: () => void;
}

export const BrandProductsPage: React.FC<BrandProductsPageProps> = ({ onCartClick }) => {
  const { categoryName, brandName } = useParams<{ categoryName: string; brandName: string }>();
  const navigate = useNavigate();
  const { products, brands, loading } = useData();
  const { cart } = useCart(); // Usar o carrinho
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleBack = () => {
    navigate(-1); // Volta para a página anterior
  };

  const handleFinishOrder = () => {
    setIsProductModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  const brand = brands.find(b => b.name.toLowerCase() === brandName?.toLowerCase());
  const brandProducts = brand ? products.filter(p => p.brand_id === brand.id) : [];

  // Encontra a quantidade atual do produto no carrinho
  const productInCart = selectedProduct ? cart.find(item => item.product.id === selectedProduct.id) : undefined;
  const initialQuantity = productInCart ? productInCart.quantity : 1;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header
        title={`${categoryName} / ${brandName}`}
        showBackButton={true}
        onBack={handleBack}
        onCartClick={onCartClick}
      />
      <main className="container mx-auto p-4 md:p-6">
        {brandProducts.length > 0 ? (
          <ProductGrid products={brandProducts} onProductSelect={handleProductSelect} />
        ) : (
          <p>Nenhum produto encontrado para esta marca.</p>
        )}
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onContinueShopping={() => setIsProductModalOpen(false)}
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
