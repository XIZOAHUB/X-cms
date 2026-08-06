import React from 'react';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2>XIZOA CMS Dashboard</h2>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;
