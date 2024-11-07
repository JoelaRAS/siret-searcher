import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const credentials = 'amFPdlRyWHNtTmkzRnhJYW1RX21feEJvdWpZYTo5emQ5ZkhKUGZvajNSaFdjV2VlNFdSYmgzTnNh';
      const response = await axios.post('https://api.insee.fr/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      res.status(200).json({ access_token: response.data.access_token });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      res.status(500).json({ error: 'Erreur lors du rafraîchissement du token' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}