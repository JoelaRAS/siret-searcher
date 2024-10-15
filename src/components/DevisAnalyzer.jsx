import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const DevisAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const analyzeDevis = async () => {
    if (!image) return;

    setIsLoading(true);
    const worker = await createWorker('fra');

    try {
      const { data: { text } } = await worker.recognize(image);
      
      // Analyse basique du texte extrait
      const analysis = analyzeText(text);
      
      setResult(analysis);
    } catch (error) {
      console.error('Erreur lors de l'analyse:', error);
      setResult('Une erreur est survenue lors de l'analyse.');
    } finally {
      await worker.terminate();
      setIsLoading(false);
    }
  };

  const analyzeText = (text) => {
    // Ici, vous pouvez implémenter une logique d'analyse plus avancée
    const lines = text.split('\n');
    let totalHT = 0;
    let totalTTC = 0;

    lines.forEach(line => {
      if (line.toLowerCase().includes('total ht')) {
        totalHT = parseFloat(line.replace(/[^0-9.,]/g, '').replace(',', '.'));
      }
      if (line.toLowerCase().includes('total ttc')) {
        totalTTC = parseFloat(line.replace(/[^0-9.,]/g, '').replace(',', '.'));
      }
    });

    return `Analyse du devis :
    Total HT détecté : ${totalHT.toFixed(2)} €
    Total TTC détecté : ${totalTTC.toFixed(2)} €
    TVA estimée : ${(totalTTC - totalHT).toFixed(2)} €`;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Analyseur de Devis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input type="file" onChange={handleImageChange} accept="image/*" />
          <Button onClick={analyzeDevis} disabled={!image || isLoading}>
            {isLoading ? 'Analyse en cours...' : 'Analyser le devis'}
          </Button>
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <pre>{result}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DevisAnalyzer;