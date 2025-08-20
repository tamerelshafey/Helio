import React from 'react';

const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-gray-700"></div>
      <div className="p-5">
        <div className="h-6 w-1/2 bg-gray-700 rounded mb-4"></div>
        <div className="h-5 w-full bg-gray-700 rounded mb-6"></div>
        <div className="flex justify-between items-center border-t border-gray-700 pt-4 mt-auto">
          <div className="h-4 w-1/4 bg-gray-700 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-700 rounded"></div>
          <div className="h-4 w-1/4 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCardSkeleton;
