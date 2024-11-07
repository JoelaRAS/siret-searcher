import axios from 'axios';

class TokenService {
  constructor() {
    this.token = null;
  }

  async getValidToken() {
    return this.refreshToken();
  }

  async refreshToken() {
    try {
      const credentials = 'amFPdlRyWHNtTmkzRnhJYW1RX21feEJvdWpZYTo5emQ5ZkhKUGZvajNSaFdjV2VlNFdSYmgzTnNh';
      console.log('Credentials:', credentials);
      
      const response = await axios.post('/api/insee/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.token = response.data.access_token;

      console.log('Nouveau token généré:', this.token);
      
      return this.token;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();