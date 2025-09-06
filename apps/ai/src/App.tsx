import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Simple ML App</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <p className="text-gray-700">Welcome to the ML App! Add data points and train a model.</p>
      </div>
    </div>
  );
};

export default App;
