import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchEntreprise } from '../api/entrepriseApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const SiretSearch = () => {
  const [siret, setSiret] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['entreprise', siret],
    queryFn: () => searchEntreprise(siret),
    enabled: searchTrigger,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchTrigger(true);
    refetch();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recherche par SIRET</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            placeholder="Entrez le numéro SIRET"
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Rechercher
          </Button>
        </form>

        {isLoading && <p className="mt-4">Chargement...</p>}
        {error && <p className="mt-4 text-red-500">Erreur : {error.message}</p>}
        {data && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">{data.nom_complet}</h2>
            <p>{data.siret}</p>
            <p>{data.adresse}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SiretSearch;