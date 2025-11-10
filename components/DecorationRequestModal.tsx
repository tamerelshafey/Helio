
import React from 'react';

// This component is currently a placeholder.
// The functionality for handling decoration requests has been centralized
// in the full-page component: `components/ServiceRequestPage.tsx`.
// This modal is likely deprecated and can be removed.

const DecorationRequestModal: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Decoration Request Modal (Placeholder)</h2>
      <p className="text-sm text-gray-500">
        This component is not currently in use. Please see `ServiceRequestPage.tsx`.
      </p>
    </div>
  );
};

export default DecorationRequestModal;
