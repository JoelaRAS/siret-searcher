import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchEntreprise, searchEntrepriseByName } from '../api/entrepriseApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const SiretSearch = () => {
  const [siret, setSiret] = useState('');
  const [name, setName] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(false);
  const [searchType, setSearchType] = useState('siret');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [searchType, siret, name],
    queryFn: () => searchType === 'siret' ? searchEntreprise(siret) : searchEntrepriseByName(name),
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
        <CardTitle>Recherche d'entreprise</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="siret" onValueChange={(value) => setSearchType(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="siret">Par SIRET</TabsTrigger>
            <TabsTrigger value="name">Par Nom</TabsTrigger>
          </TabsList>
          <TabsContent value="siret">
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
          </TabsContent>
          <TabsContent value="name">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Entrez le nom de l'entreprise"
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Rechercher
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {isLoading && <p className="mt-4">Chargement...</p>}
        {error && <p className="mt-4 text-red-500">Erreur : {error.message}</p>}
        {data && Array.isArray(data) ? (
          <div className="mt-4 space-y-4">
            {data.map((entreprise, index) => (
              <div key={index} className="border p-4 rounded">
                <h2 className="text-xl font-semibold">{entreprise.nom_complet}</h2>
                <p>SIRET : {entreprise.siret}</p>
                <p>Adresse : {entreprise.adresse}</p>
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold">{data.nom_complet}</h2>
            <p>SIRET : {data.siret}</p>
            <p>Adresse : {data.adresse}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default SiretSearch;