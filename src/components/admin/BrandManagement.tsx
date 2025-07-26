
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Brand } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = API_URL.replace('/api', '');

export const BrandManagement: React.FC = () => {
  const { brands, categories, addBrand, updateBrand, deleteBrand } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: 0,
    image_url: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      if (editingBrand) {
        setFormData({
          name: editingBrand.name,
          category_id: editingBrand.category_id,
          image_url: editingBrand.image_url || ''
        });
        if (editingBrand.image_url) {
          setImagePreview(editingBrand.image_url);
        } else {
          setImagePreview(null);
        }
      } else {
        resetForm(false);
      }
    }
  }, [editingBrand, isModalOpen]);

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
    const fileInput = document.getElementById('brand-image-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleImageUpload = async (): Promise<string | undefined> => {
    if (!selectedImage) return formData.image_url;

    const data = new FormData();
    data.append('type', 'brand');
    data.append('image', selectedImage);

    try {
      const response = await axios.post(`${API_URL}/upload`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    if (formData.category_id === 0) {
      alert('Por favor, selecione uma categoria.');
      return;
    }
    
    let finalImageUrl = formData.image_url;

    if (selectedImage) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl === undefined) return;
      finalImageUrl = uploadedUrl;
    }

    const dataToSubmit = {
      ...formData,
      image_url: finalImageUrl,
    };

    if (editingBrand) {
      updateBrand(editingBrand.id, dataToSubmit);
    } else {
      addBrand(dataToSubmit);
    }
    closeModal();
  };

  const resetForm = (close = true) => {
    setFormData({ name: '', category_id: 0, image_url: '' });
    setSelectedImage(null);
    setEditingBrand(null);
    setImagePreview(null);
    if (close) {
      setIsModalOpen(false);
    }
  };

  const closeModal = () => {
    resetForm(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const openNewBrandModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta marca? Todos os produtos relacionados serão removidos.')) {
      deleteBrand(id);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Marcas</h1>
        <button
          onClick={openNewBrandModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Marca</span>
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {brands.map((brand) => (
              <tr key={brand.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {brand.image_url ? (
                      <img src={`${API_BASE_URL}${brand.image_url}`} alt={brand.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" /> // Placeholder
                    )}
                    <span className="text-sm font-medium text-gray-900">{brand.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getCategoryName(brand.category_id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingBrand ? 'Editar Marca' : 'Nova Marca'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Imagem da Marca</label>
                      <input
                        id="brand-image-input"
                        type="file"
                        accept=".webp,.png,.jpg,.jpeg"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {imagePreview && (
                        <div className="mt-2 relative w-24 h-24">
                          <img
                            src={imagePreview}
                            alt="Prévia da Imagem"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0} disabled>Selecione uma categoria</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingBrand ? 'Atualizar' : 'Criar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )} 
    </div>
  );
};