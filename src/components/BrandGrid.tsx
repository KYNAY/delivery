import React from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../types';

interface BrandGridProps {
  brands: Brand[];
  categoryName: string;
}

export const BrandGrid: React.FC<BrandGridProps> = ({ brands, categoryName }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {brands.map((brand) => (
        <Link
          key={brand.id}
          to={`/categoria/${encodeURIComponent(categoryName.toLowerCase())}/${encodeURIComponent(brand.name.toLowerCase())}`}
          className="block bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 text-center"
        >
          {brand.image_url ? (
            <img src={brand.image_url} alt={brand.name} className="w-24 h-24 object-contain mx-auto mb-4" />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-md mx-auto mb-4">
              <span className="text-gray-500 text-sm">Sem Imagem</span>
            </div>
          )}
          <h3 className="font-semibold text-gray-800">{brand.name}</h3>
        </Link>
      ))}
    </div>
  );
};