import React from 'react';
import SiretSearch from '../components/SiretSearch';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Recherche d'entreprise</h1>
      <SiretSearch />
    </div>
  );
};

export default Index;