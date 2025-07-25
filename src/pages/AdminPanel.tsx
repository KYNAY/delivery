import React, { useState, useEffect } from 'react';
import { AdminLogin } from '../components/admin/AdminLogin';
import { Dashboard } from '../components/admin/Dashboard';
import { ProductManagement } from '../components/admin/ProductManagement';
import { CategoryManagement } from '../components/admin/CategoryManagement';
import { BrandManagement } from '../components/admin/BrandManagement';
import { OrderManagement } from '../components/admin/OrderManagement';
import { UserManagement } from '../components/admin/UserManagement';
import { Settings } from '../components/admin/Settings';
import StockManagement from '../components/admin/StockManagement'; // Importar
import {
  BarChart3,
  Package,
  FolderOpen,
  Settings as SettingsIcon,
  LogOut,
  ClipboardList,
  Users,
  Tag,
  Boxes, // Novo ícone para Estoque
} from 'lucide-react';

type AdminView = 'dashboard' | 'products' | 'categories' | 'brands' | 'orders' | 'stock' | 'users' | 'settings';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  useEffect(() => {
    const loggedIn = localStorage.getItem('isAdminLoggedIn');
    if (loggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: 'Pedidos', icon: ClipboardList },
    { id: 'stock', label: 'Gerenciar Estoque', icon: Boxes },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'categories', label: 'Categorias', icon: FolderOpen },
    { id: 'brands', label: 'Marcas', icon: Tag },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'brands':
        return <BrandManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'stock':
        return <StockManagement />;
      case 'users':
        return <UserManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Painel Admin</h1>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AdminView)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 text-red-600 mt-4"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};