import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { CartProvider } from './contexts/CartContext';
import { HomePage } from './pages/HomePage';
import { AdminPanel } from './pages/AdminPanel';
import { BrandProductsPage } from './pages/BrandProductsPage';
import { CartModal } from './components/CartModal';
import { CheckoutForm } from './components/CheckoutForm'; // Importar CheckoutForm

function App() {
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Novo estado para CheckoutForm

  const handleOpenCartModal = () => setIsCartModalOpen(true);
  const handleCloseCartModal = () => setIsCartModalOpen(false);

  const handleOpenCheckoutForm = () => {
    setIsCartModalOpen(false); // Fecha o modal do carrinho
    setIsCheckoutOpen(true); // Abre o formulário de checkout
  };

  const handleCloseCheckoutForm = () => setIsCheckoutOpen(false);
  const handleCheckoutSuccess = () => setIsCheckoutOpen(false);

  return (
    <DataProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage onCartClick={handleOpenCartModal} />} />
            <Route path="/categoria/:categoryName" element={<HomePage onCartClick={handleOpenCartModal} />} />
            <Route path="/painel-admin" element={<AdminPanel />} />
            <Route path="/categoria/:categoryName/:brandName" element={<BrandProductsPage onCartClick={handleOpenCartModal} />} />
          </Routes>
        </Router>
        <CartModal isOpen={isCartModalOpen} onClose={handleCloseCartModal} onFinishOrder={handleOpenCheckoutForm} />
        <CheckoutForm isOpen={isCheckoutOpen} onClose={handleCloseCheckoutForm} onSuccess={handleCheckoutSuccess} />
      </CartProvider>
    </DataProvider>
  );
}

export default App;