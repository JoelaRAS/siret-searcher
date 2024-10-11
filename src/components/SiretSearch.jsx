import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchEntreprise, searchEntrepriseByName } from '../api/entrepriseApi';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const SiretSearch = () => {
  const [query, setQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(false);
  const [searchType, setSearchType] = useState('siret');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [searchType, query],
    queryFn: () => searchType === 'siret' ? searchEntreprise(query) : searchEntrepriseByName(query),
    enabled: searchTrigger,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchTrigger(true);
    refetch();
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Recherche d'entreprise</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="siret" onValueChange={(value) => setSearchType(value)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="siret">Par SIRET/SIREN</TabsTrigger>
            <TabsTrigger value="name">Par Nom</TabsTrigger>
          </TabsList>
          <TabsContent value="siret">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Entrez le numéro SIRET ou SIREN (complet ou partiel)"
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Entrez le nom de l'entreprise (complet ou partiel)"
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
        {data && (
          <div className="mt-4 space-y-4">
            {data.map((entreprise, index) => (
              <div key={index} className="border p-4 rounded">
                <h2 className="text-xl font-semibold">{entreprise.nom_complet}</h2>
                <p><strong>SIRET :</strong> {entreprise.siret}</p>
                <p><strong>SIREN :</strong> {entreprise.siren}</p>
                <p><strong>NIC :</strong> {entreprise.nic}</p>
                <p><strong>Adresse :</strong> {entreprise.adresse}</p>
                <p><strong>N° TVA Intracommunautaire :</strong> {entreprise.numero_tva_intracommunautaire}</p>
                <p><strong>Dirigeant(s) :</strong> {entreprise.dirigeants}</p>
                <p><strong>Date de création :</strong> {entreprise.date_creation}</p>
                <p><strong>Tranche d'effectif :</strong> {entreprise.tranche_effectif}</p>
                <p><strong>Activité principale :</strong> {entreprise.activite_principale}</p>
                <p><strong>Nature juridique :</strong> {entreprise.nature_juridique}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SiretSearch;