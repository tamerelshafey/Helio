
import React from 'react';

// This component is a placeholder for a generic dashboard layout.
// The application currently uses more specific layouts:
// - `AdminDashboardLayout.tsx` for administrative roles.
// - `PartnerDashboardLayout.tsx` for partner roles.
// This file is likely a remnant of a previous structure and can be removed.

const DashboardLayout: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Generic Dashboard Layout (Placeholder)</h2>
      <p className="text-sm text-gray-500">
        This component is not currently in use.
      </p>
    </div>
  );
};

export default DashboardLayout;
