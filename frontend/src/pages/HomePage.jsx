import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="main-container">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-farm-dark-green">Welcome to GreenFarmIQ</h1>
            <p className="text-gray-600 mt-2">Select your role to sign in</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/login?role=buyer" className="card buyer-card text-center py-10 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-3">🏨</div>
              <div className="text-xl font-bold">Buyer Login</div>
              <div className="text-sm text-gray-600 mt-1">Hotels • Wholesalers • Exporters</div>
            </Link>
            <Link to="/login?role=farmer" className="card farm-card text-center py-10 hover:shadow-lg transition-shadow">
              <div className="text-5xl mb-3">🚜</div>
              <div className="text-xl font-bold">Farmer Login</div>
              <div className="text-sm text-gray-600 mt-1">Verified producers and suppliers</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
