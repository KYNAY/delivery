import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, X } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = API_URL.replace('/api', '');

export const Settings: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useData();
  const [formData, setFormData] = useState({
    store_name: '',
    logo_url: '',
    whatsapp_number: '',
    address: '',
    pix_key: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (storeSettings) {
      setFormData({
        store_name: storeSettings.store_name || '',
        logo_url: storeSettings.logo_url || '',
        whatsapp_number: storeSettings.whatsapp_number || '',
        address: storeSettings.address || '',
        pix_key: storeSettings.pix_key || '',
      });
      if (storeSettings.logo_url) {
        setImagePreview(storeSettings.logo_url);
      } else {
        setImagePreview(null);
      }
    }
  }, [storeSettings]);

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
    setFormData(prev => ({ ...prev, logo_url: '' }));
    const fileInput = document.getElementById('logo-input') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleImageUpload = async (): Promise<string | undefined> => {
    if (!selectedImage) return formData.logo_url;

    const data = new FormData();
    data.append('type', 'logo');
    data.append('image', selectedImage);

    try {
      const response = await axios.post(`${API_URL}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      alert('Erro ao fazer upload do logo.');
      return undefined;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalLogoUrl = formData.logo_url;
    if (selectedImage) {
      const uploadedUrl = await handleImageUpload();
      if (uploadedUrl === undefined) return; // Para se o upload falhar
      finalLogoUrl = uploadedUrl;
    }

    const dataToSubmit = { ...formData, logo_url: finalLogoUrl };
    
    updateStoreSettings(dataToSubmit);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      
      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Distribuidora</label>
            <input
              type="text"
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo da Loja</label>
            <input
              id="logo-input"
              type="file"
              accept=".webp,.png,.jpg,.jpeg"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imagePreview && (
              <div className="mt-4 relative inline-block">
                <img src={imagePreview} alt="Preview do logo" className="w-24 h-24 rounded-lg object-cover" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Número do WhatsApp</label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="5511999999999"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Endereço da Distribuidora</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chave Pix</label>
            <input
              type="text"
              value={formData.pix_key}
              onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
            
            {saved && (
              <span className="text-green-600 text-sm font-medium animate-pulse">
                Configurações salvas!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};