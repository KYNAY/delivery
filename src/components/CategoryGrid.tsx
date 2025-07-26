import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/categoria/${encodeURIComponent(category.name.toLowerCase())}`}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col items-center space-y-2"
        >
          {category.image_url ? (
            <img src={category.image_url} alt={category.name} className="w-16 h-16 object-cover rounded-full" />
          ) : (
            <div className="text-3xl">{category.icon}</div>
          )}
          <span className="text-sm font-medium text-gray-700 text-center">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
};