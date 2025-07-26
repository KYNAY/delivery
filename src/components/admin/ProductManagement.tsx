import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = API_URL.replace('/api', '');

const initialFormData = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  category_id: 0,
  brand_id: 0,
  stock_quantity: 0,
  is_available: true
};

export const ProductManagement: React.FC = () => {
  const { products, categories, brands, addProduct, updateProduct, deleteProduct } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filteredBrands = formData.category_id ? brands.filter(brand => brand.category_id === formData.category_id) : [];

  useEffect(() => {
    if (isModalOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          image_url: editingProduct.image_url || '',
          category_id: editingProduct.category_id,
          brand_id: editingProduct.brand_id,
          stock_quantity: editingProduct.stock_quantity,
          is_available: editingProduct.is_available
        });
        if (editingProduct.image_url) {
          setImagePreview(editingProduct.image_url);
        } else {
          setImagePreview(null);
        }
      } else {
        resetForm(false);
      }
    }
  }, [editingProduct, isModalOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    const fileInput = document.getElementById('product-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleImageUpload = async (): Promise<string | undefined> => {
    if (!selectedImage) return formData.image_url;

    const data = new FormData();
    data.append('type', 'product');
    data.append('image', selectedImage);

    try {
      const response = await axios.post(`${API_URL}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem.');
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category_id === 0 || formData.brand_id === 0) {
      alert('Por favor, selecione a categoria e a marca.');
      return;
    }

    let finalImageUrl = formData.image_url;
    if (selectedImage) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl === undefined) return;
      finalImageUrl = uploadedUrl;
    }

    const dataToSubmit = { ...formData, image_url: finalImageUrl };

    if (editingProduct) {
      updateProduct(editingProduct.id, dataToSubmit);
    } else {
      addProduct(dataToSubmit);
    }
    closeModal();
  };

  const resetForm = (close = true) => {
    setFormData(initialFormData);
    setSelectedImage(null);
    setEditingProduct(null);
    setImagePreview(null);
    if (close) setIsModalOpen(false);
  };

  const closeModal = () => resetForm(true);
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  const openNewProductModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const getCategoryName = (id: number) => categories.find(c => c.id === id)?.name || 'N/A';
  const getBrandName = (id: number) => brands.find(b => b.id === id)?.name || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
        <button
          onClick={openNewProductModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image_url ? (
                        <img src={`${API_BASE_URL}${product.image_url}`} alt={product.name} className="w-10 h-10 rounded-lg object-cover mr-4" />
                      ) : (
                        <Package className="w-10 h-10 text-gray-400 mr-4" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getCategoryName(product.category_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getBrandName(product.brand_id)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock_quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.is_available ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coluna 1 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                          <input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                          <input type="number" required value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="is_available" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">Produto disponível</label>
                      </div>
                    </div>
                    {/* Coluna 2 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto</label>
                        <input id="product-image-input" type="file" accept=".webp,.png,.jpg,.jpeg" onChange={handleImageChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        {imagePreview && (
                          <div className="mt-2 relative w-28 h-28">
                            <img src={imagePreview} alt="Prévia" className="w-full h-full object-cover rounded-md" />
                            <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value), brand_id: 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                          <option value={0} disabled>Selecione</option>
                          {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <select required value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={!formData.category_id || filteredBrands.length === 0}>
                          <option value={0} disabled>Selecione</option>
                          {filteredBrands.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">{editingProduct ? 'Atualizar' : 'Criar'}</button>
                  <button type="button" onClick={closeModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};