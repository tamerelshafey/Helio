
import React from 'react';

// This component is a placeholder.
// The functionality for editing properties (by both admins and partners) is
// handled by the reusable form component: `components/forms/PropertyFormPage.tsx`.
// This modal is likely a remnant of a previous design and can be removed.

const AdminPropertyEditModal: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Admin Property Edit Modal (Placeholder)</h2>
      <p className="text-sm text-gray-500">
        This component is not in use. See `PropertyFormPage.tsx`.
      </p>
    </div>
  );
};

export default AdminPropertyEditModal;
