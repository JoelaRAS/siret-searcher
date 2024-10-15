import React from 'react';
import SiretSearch from '../components/SiretSearch';
import DevisAnalyzer from '../components/DevisAnalyzer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Outils d'entreprise</h1>
      <SiretSearch />
      <DevisAnalyzer />
    </div>
  );
};

export default Index;