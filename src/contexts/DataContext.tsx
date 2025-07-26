import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Category, Brand, Product, Order, StoreSettings } from '../types';
import axios from 'axios'; // Usaremos axios para as requisições HTTP

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DataContextType {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  orders: Order[];
  storeSettings: StoreSettings;
  loading: boolean;
  // Categories
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Brands
  addBrand: (brand: Omit<Brand, 'id' | 'created_at'>) => void;
  updateBrand: (id: string, brand: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  // Products
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Orders
  addOrder: (order: Omit<Order, 'id' | 'created_at'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  // Settings
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({} as StoreSettings);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, brandsRes, productsRes, settingsRes, ordersRes] = await Promise.all([
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/brands`),
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/settings`),
        axios.get(`${API_URL}/orders`)
      ]);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
      const productsData = productsRes.data.map((p: Product) => ({
        ...p,
        price: parseFloat(p.price as any),
      }));
      setProducts(productsData);
      setStoreSettings(settingsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados da API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Categories
  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      await axios.post(`${API_URL}/categories`, category);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  const updateCategory = async (id: number, category: Partial<Category>) => {
    try {
      await axios.put(`${API_URL}/categories/${id}`, category);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  // Brands
  const addBrand = async (brand: Omit<Brand, 'id' | 'created_at'>) => {
    try {
      await axios.post(`${API_URL}/brands`, brand);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao adicionar marca:', error);
    }
  };

  const updateBrand = async (id: number, brand: Partial<Brand>) => {
    try {
      await axios.put(`${API_URL}/brands/${id}`, brand);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao atualizar marca:', error);
    }
  };

  const deleteBrand = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/brands/${id}`);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao deletar marca:', error);
    }
  };

  // Products
  const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      await axios.post(`${API_URL}/products`, product);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  const updateProduct = async (id: number, product: Partial<Product>) => {
    try {
      await axios.put(`${API_URL}/products/${id}`, product);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };

  // Orders
  const addOrder = async (order: Omit<Order, 'id' | 'created_at'> & { items: { product_id: number; quantity: number; price_at_purchase: number }[] }) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, order);
      fetchData(); // Re-fetch data
      return response.data.id;
    } catch (error) {
      console.error('Erro ao adicionar pedido:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (id: number, status: Order['status']) => {
    try {
      await axios.put(`${API_URL}/orders/${id}/status`, { status });
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/orders/${id}`);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
    }
  };

  // Settings
  const updateStoreSettings = async (settings: Partial<StoreSettings>) => {
    try {
      await axios.put(`${API_URL}/settings`, settings);
      fetchData(); // Re-fetch data
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
    }
  };

  return (
    <DataContext.Provider value={{
      categories,
      brands,
      products,
      orders,
      storeSettings,
      loading,
      addCategory,
      updateCategory,
      deleteCategory,
      addBrand,
      updateBrand,
      deleteBrand,
      addProduct,
      updateProduct,
      deleteProduct,
      addOrder,
      updateOrderStatus,
      deleteOrder,
      updateStoreSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};