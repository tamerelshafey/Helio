
import React from 'react';

// This component is a placeholder.
// The sidebar for the partner dashboard has been integrated directly into
// the main layout component: `components/partner-dashboard/PartnerDashboardLayout.tsx`.
// This separate file is no longer in use and can be removed.

const PartnerSidebar: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Partner Sidebar (Placeholder)</h2>
      <p className="text-sm text-gray-500">
        This component is not in use. Its logic is part of `PartnerDashboardLayout.tsx`.
      </p>
    </div>
  );
};

export default PartnerSidebar;
