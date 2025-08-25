import React from 'react';
import Navigation from './negative';
import ModernDashboardAdmin from './dashboardAdmin';

const Panel = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16"> {/* Padding to account for fixed nav */}
        <ModernDashboardAdmin />
      </div>
    </div>
  );
};

export default Panel;