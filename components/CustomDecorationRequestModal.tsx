
import React from 'react';

// This component is a placeholder.
// The functionality for handling custom decoration requests has been integrated
// into the more general `components/ServiceRequestPage.tsx` component,
// which handles different service types conditionally.
// This modal is likely deprecated and can be removed.

const CustomDecorationRequestModal: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Custom Decoration Request Modal (Placeholder)</h2>
      <p className="text-sm text-gray-500">
        This component is not in use. Please see `ServiceRequestPage.tsx`.
      </p>
    </div>
  );
};

export default CustomDecorationRequestModal;
