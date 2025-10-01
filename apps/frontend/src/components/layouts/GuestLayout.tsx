import React from 'react';
import { Outlet } from 'react-router-dom';

const GuestLayout: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Outlet />
    </div>
  );
};

export default GuestLayout;