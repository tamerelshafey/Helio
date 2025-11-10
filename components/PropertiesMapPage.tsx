
import React from 'react';

// This component is currently a placeholder.
// The map view for properties has been integrated directly into the `PropertiesPage.tsx`
// component, which uses `PropertiesMapView.tsx` for rendering.
// A dedicated page for the map is not currently part of the application's routing.

const PropertiesMapPage: React.FC = () => {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">Properties Map Page (Placeholder)</h1>
      <p className="text-gray-600">
        Map functionality is available on the main{' '}
        <a href="/#/properties" className="text-amber-500 underline">
          Properties Page
        </a>
        .
      </p>
    </div>
  );
};

export default PropertiesMapPage;
